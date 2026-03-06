require("dotenv").config();
const { emailQueue, scheduledEmailQueue, transactionalQueue } = require("../config/queue");
const SmtpAccount = require("../models/SmtpAccount");
const ScheduledMail = require("../models/scheduledMailDB");
const BulkEmailJob = require("../models/bulkEmailJobDB");
const {
  sendSingleEmail,
  processAttachments,
  _doSendOTPEmail,
  _doSendSuspensionEmail,
  _doSendUnsuspensionEmail,
} = require("../utilities/mailUtil");
const smtpUtil = require("../utilities/smtpUtil");
const Company = require("../models/companyDB");
const User = require("../models/userDB");

// ─────────────────────────────────────────────────────────────────────────────
// In-process SmtpAccount cache
// Avoids N individual Mongo lookups for each recipient in a bulk send.
// TTL of 60s is short enough to pick up status/limit changes promptly.
// ─────────────────────────────────────────────────────────────────────────────
const smtpCache = new Map();
const SMTP_CACHE_TTL = 60_000; // 60 seconds

const getCachedSmtpAccount = async (id) => {
  const hit = smtpCache.get(id);
  if (hit && Date.now() - hit.ts < SMTP_CACHE_TTL) return hit.account;

  const account = await SmtpAccount.findById(id);
  if (account) smtpCache.set(id, { account, ts: Date.now() });
  return account;
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery log helper — unified for ScheduledMail and BulkEmailJob
// modelType: 'scheduled' | 'bulk'
// ─────────────────────────────────────────────────────────────────────────────
const writeDeliveryOutcome = async (modelType, jobId, recipientEmail, outcome) => {
  if (!jobId) return;

  const Model = modelType === 'bulk' ? BulkEmailJob : ScheduledMail;
  // Top-level status labels differ between the two models
  const statusMap = modelType === 'bulk'
    ? { sent: 'sent', failed: 'failed', partial: 'partially_sent' }
    : { sent: 'Sent', failed: 'Failed', partial: 'Partially Sent' };

  try {
    // Atomically update the matching log entry
    const newStatus = outcome.skipped ? 'skipped'
      : outcome.success ? 'sent' : 'failed';
    await Model.updateOne(
      { _id: jobId, 'deliveryLog.email': recipientEmail },
      {
        $set: {
          'deliveryLog.$.status': newStatus,
          'deliveryLog.$.sentAt': outcome.success ? new Date() : null,
          'deliveryLog.$.error': outcome.skipped ? 'Recipient unsubscribed' : (outcome.error || null),
        },
      }
    );

    // Re-fetch counts and resolve top-level status when all recipients are done
    const doc = await Model.findById(jobId).select('deliveryLog').lean();
    if (!doc) return;

    const log = doc.deliveryLog || [];
    const total = log.length;
    const sent = log.filter(e => e.status === 'sent').length;
    const failed = log.filter(e => e.status === 'failed').length;
    const skipped = log.filter(e => e.status === 'skipped').length;
    const pending = log.filter(e => e.status === 'pending').length;

    if (pending > 0) return; // still waiting on other recipients

    const topStatus = (failed === 0 && skipped === 0) ? statusMap.sent
      : sent === 0 ? statusMap.failed
        : statusMap.partial;

    await Model.findByIdAndUpdate(jobId, { status: topStatus });
    console.log(`📊 [${modelType}] ${jobId} resolved → ${topStatus} (${sent}/${total} sent)`);
  } catch (err) {
    console.error(`writeDeliveryOutcome [${modelType}] ${jobId}:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// single-email: send one email using mailUtil.sendSingleEmail
// ─────────────────────────────────────────────────────────────────────────────
const processSingleEmail = async (job) => {
  const { to, subject, html, recipientName, attachments, smtpAccountId, scheduledMailId, bulkJobId, userId, skipUnsubscribed } = job.data;

  // ── Check if recipient has unsubscribed from this sender (only when skip is NOT enabled) ──
  if (userId && !skipUnsubscribed) {
    const isUnsubscribed = await Company.exists({
      companyEmail: to.toLowerCase().trim(),
      createdBy: userId,
      unsubscribed: true,
    });
    if (isUnsubscribed) {
      console.log(`⚠️  Skipping ${to} — unsubscribed from sender ${userId}`);
      if (scheduledMailId) await writeDeliveryOutcome('scheduled', scheduledMailId, to, { skipped: true });
      if (bulkJobId) await writeDeliveryOutcome('bulk', bulkJobId, to, { skipped: true });
      return { skipped: true, to };
    }
  }

  try {
    const smtpAccount = await getCachedSmtpAccount(smtpAccountId);
    const result = await sendSingleEmail({ to, subject, html, recipientName, attachments, smtpAccountId, smtpAccount, senderId: userId, skipUnsubscribed });

    // Write success to whichever parent job originated this send
    if (scheduledMailId) await writeDeliveryOutcome('scheduled', scheduledMailId, to, { success: true });
    if (bulkJobId) await writeDeliveryOutcome('bulk', bulkJobId, to, { success: true });
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);

    if (smtpAccountId) {
      try {
        await SmtpAccount.findByIdAndUpdate(smtpAccountId, {
          $set: {
            'errorLog.lastError': error.message,
            'errorLog.lastErrorAt': new Date(),
            status: 'error',
          },
        });
        smtpCache.delete(smtpAccountId);
      } catch (logError) {
        console.error("Failed to log error to SMTP account:", logError);
      }
    }

    // Record failure only on the final retry
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      if (scheduledMailId) await writeDeliveryOutcome('scheduled', scheduledMailId, to, { success: false, error: error.message });
      if (bulkJobId) await writeDeliveryOutcome('bulk', bulkJobId, to, { success: false, error: error.message });
    }

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// bulk-email: seed BulkEmailJob deliveryLog, then fan-out to single-email jobs
// ─────────────────────────────────────────────────────────────────────────────
const processBulkEmail = async (job) => {
  const { emails, subject, html, attachments, smtpAccountId, userId, bulkJobId, skipUnsubscribed } = job.data;

  try {
    const smtpAccount = await getCachedSmtpAccount(smtpAccountId);
    if (!smtpAccount) throw new Error(`SMTP account ${smtpAccountId} not found`);
    if (!smtpUtil.canSendEmail(smtpAccount)) {
      throw new Error(`SMTP account cannot send emails. Status: ${smtpAccount.status}`);
    }

    // Seed the BulkEmailJob deliveryLog and mark Processing
    if (bulkJobId) {
      const seedLog = emails.map(e => ({
        email: e.to,
        name: e.recipientName || 'User',
        status: 'pending',
      }));
      await BulkEmailJob.findByIdAndUpdate(bulkJobId, {
        status: 'processing',
        deliveryLog: seedLog,
      });
    }

    await Promise.all(
      emails.map((email) =>
        emailQueue.add(
          "single-email",
          {
            to: email.to,
            recipientName: email.recipientName,
            subject,
            html,
            attachments,
            smtpAccountId,
            userId,
            bulkJobId: bulkJobId || null, // ← passed through so processSingleEmail can write back
            skipUnsubscribed,
          },
          { priority: 5, attempts: 3, removeOnComplete: true, removeOnFail: false }
        )
      )
    );

    return {
      success: true,
      message: `${emails.length} emails queued successfully`,
      totalEmails: emails.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to process bulk email:", error.message);
    if (bulkJobId) {
      await BulkEmailJob.findByIdAndUpdate(bulkJobId, { status: 'failed' }).catch(() => { });
    }
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// scheduled-email: resolve attachments, append signature, seed deliveryLog, fan-out
// ─────────────────────────────────────────────────────────────────────────────
const processScheduledEmail = async (job) => {
  const { to, recipientPeople, subject, html, attachments, scheduledMailId, smtpAccountId, userId } = job.data;

  // Look up the sender's skipUnsubscribed preference once for the whole fan-out
  let skipUnsubscribed = false; // default
  if (userId) {
    try {
      const sender = await User.findById(userId).select('skipUnsubscribed').lean();
      if (sender) skipUnsubscribed = sender.skipUnsubscribed ?? false;
    } catch (err) {
      console.error('Failed to fetch sender skipUnsubscribed:', err.message);
    }
  }

  try {
    const processedAttachments = await processAttachments(attachments);

    // Append account signature if present
    let finalHtml = html;
    const smtpAccount = await getCachedSmtpAccount(smtpAccountId);
    if (smtpAccount?.signature) {
      finalHtml = `${html}<br/><br/>--<br/>${smtpAccount.signature}`;
    }

    // Seed the deliveryLog with one pending entry per recipient and mark Processing
    if (scheduledMailId) {
      const seedLog = to.map((email, i) => ({
        email,
        name: recipientPeople[i] || 'User',
        status: 'pending',
      }));
      const updatedMail = await ScheduledMail.findByIdAndUpdate(scheduledMailId, {
        status: 'Processing',
        deliveryLog: seedLog,
      });

      if (!updatedMail) {
        console.log(`⚠️ Scheduled mail ${scheduledMailId} deleted before execution. Aborting.`);
        return { skipped: true, reason: 'Scheduled mail was deleted' };
      }
    }

    // Fan out — each job carries scheduledMailId so it can write back its outcome
    await Promise.all(
      to.map((email, i) =>
        emailQueue.add(
          "single-email",
          {
            to: email,
            recipientName: recipientPeople[i] || "User",
            subject,
            html: finalHtml,
            attachments: processedAttachments,
            smtpAccountId,
            userId: userId || null,
            scheduledMailId: scheduledMailId || null,
            skipUnsubscribed,
          },
          { priority: 3, attempts: 3, removeOnComplete: true, removeOnFail: false }
        )
      )
    );

    return {
      success: true,
      message: `${to.length} scheduled emails queued successfully`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to process scheduled email:", error.message);
    if (scheduledMailId) {
      await ScheduledMail.findByIdAndUpdate(scheduledMailId, { status: 'Failed' }).catch(() => { });
    }
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue processors
// Concurrency rationale:
//   single-email: I/O-bound (SMTP handshake + network). 25 concurrent sends is
//     safe and directly improves bulk throughput without CPU pressure.
//   bulk-email: just Redis writes (fan-out) — 5 is plenty.
//   scheduled-email: one-at-a-time is correct; it fans out to single-email.
//   transactional-email: 10 — fast OTP/notification sends, bump from original.
// ─────────────────────────────────────────────────────────────────────────────
emailQueue.process("single-email", 25, processSingleEmail);
emailQueue.process("bulk-email", 5, processBulkEmail);
scheduledEmailQueue.process("scheduled-email", processScheduledEmail);

// ─────────────────────────────────────────────────────────────────────────────
// transactional-email: OTP, suspension, unsuspension
// High concurrency (10) — these are fast, independent sends
// ─────────────────────────────────────────────────────────────────────────────
const processTransactionalEmail = async (job) => {
  const { type } = job.data;
  switch (type) {
    case "otp":
      await _doSendOTPEmail(job.data.mail, job.data.otp);
      return { success: true, type, to: job.data.mail };
    case "suspension":
      await _doSendSuspensionEmail(job.data.email, job.data.fullName, job.data.reason);
      return { success: true, type, to: job.data.email };
    case "unsuspension":
      await _doSendUnsuspensionEmail(job.data.email, job.data.fullName);
      return { success: true, type, to: job.data.email };
    default:
      throw new Error(`Unknown transactional email type: ${type}`);
  }
};

transactionalQueue.process("transactional-email", 10, processTransactionalEmail);

// Error / failure listeners
emailQueue.on("error", (error) => console.error("❌ Email queue error:", error));
emailQueue.on("failed", (job, err) => console.error(`❌ Email job ${job.id} failed:`, err.message));
scheduledEmailQueue.on("error", (error) => console.error("❌ Scheduled email queue error:", error));
scheduledEmailQueue.on("failed", (job, err) => console.error(`❌ Scheduled email job ${job.id} failed:`, err.message));
transactionalQueue.on("error", (error) => console.error("❌ Transactional queue error:", error));
transactionalQueue.on("failed", (job, err) => console.error(`❌ Transactional job ${job.id} (${job.data?.type}) failed:`, err.message));

// Optional verbose logging (set ENABLE_QUEUE_LOGGING=true in .env)
if (process.env.ENABLE_QUEUE_LOGGING === "true") {
  console.log("⚠️ Queue logging enabled (debug mode)");
  emailQueue.on("completed", (job, result) => console.log(`✅ Email job ${job.id} completed:`, result.to));
  emailQueue.on("stalled", (job) => console.warn(`⚠️ Email job ${job.id} stalled`));
  scheduledEmailQueue.on("completed", (job, result) => console.log(`✅ Scheduled job ${job.id} completed:`, result.message));
  scheduledEmailQueue.on("stalled", (job) => console.warn(`⚠️ Scheduled job ${job.id} stalled`));
  transactionalQueue.on("completed", (job, result) => console.log(`✅ Transactional job ${job.id} (${result.type}) completed:`, result.to));
  transactionalQueue.on("stalled", (job) => console.warn(`⚠️ Transactional job ${job.id} stalled`));
}

// Graceful shutdown
const closeQueues = async () => {
  await emailQueue.close();
  await scheduledEmailQueue.close();
  await transactionalQueue.close();
  process.exit(0);
};
process.on("SIGTERM", closeQueues);
process.on("SIGINT", closeQueues);

console.log("✅ Email workers started successfully");

module.exports = { emailQueue, scheduledEmailQueue, transactionalQueue };