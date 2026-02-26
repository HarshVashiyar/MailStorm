require("dotenv").config();
const { emailQueue, scheduledEmailQueue } = require("../config/queue");
const SmtpAccount = require("../models/SmtpAccount");
const { sendSingleEmail, processAttachments } = require("../utilities/mailUtil");

// ─────────────────────────────────────────────────────────────────────────────
// single-email: send one email using mailUtil.sendSingleEmail
// ─────────────────────────────────────────────────────────────────────────────
const processSingleEmail = async (job) => {
  const { to, subject, html, recipientName, attachments, smtpAccountId } = job.data;

  try {
    return await sendSingleEmail({ to, subject, html, recipientName, attachments, smtpAccountId });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);

    // Mark SMTP account as errored so the UI can surface it
    if (smtpAccountId) {
      try {
        const smtpAccount = await SmtpAccount.findById(smtpAccountId);
        if (smtpAccount) {
          smtpAccount.errorLog.lastError = error.message;
          smtpAccount.errorLog.lastErrorAt = new Date();
          smtpAccount.status = "error";
          await smtpAccount.save();
        }
      } catch (logError) {
        console.error("Failed to log error to SMTP account:", logError);
      }
    }

    throw error; // Re-throw so Bull marks the job as failed and retries
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// bulk-email: fan-out to individual single-email jobs
// ─────────────────────────────────────────────────────────────────────────────
const processBulkEmail = async (job) => {
  const { emails, subject, html, attachments, smtpAccountId, userId } = job.data;

  try {
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
            bulkJobId: job.id,
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
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// scheduled-email: resolve attachments, append signature, fan-out to single-email jobs
// ─────────────────────────────────────────────────────────────────────────────
const processScheduledEmail = async (job) => {
  const { to, recipientPeople, subject, html, attachments, scheduledMailId, smtpAccountId } = job.data;

  try {
    const processedAttachments = await processAttachments(attachments);

    // Append account signature if present
    let finalHtml = html;
    if (smtpAccountId) {
      const smtpAccount = await SmtpAccount.findById(smtpAccountId);
      if (smtpAccount?.signature) {
        finalHtml = `${html}<br/><br/>--<br/>${smtpAccount.signature}`;
      }
    }

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
          },
          { priority: 3, removeOnComplete: true, removeOnFail: false }
        )
      )
    );

    if (scheduledMailId) {
      const ScheduledMail = require("../models/scheduledMailDB");
      await ScheduledMail.findByIdAndUpdate(scheduledMailId, { status: "Sent" });
    }

    return {
      success: true,
      message: `${to.length} scheduled emails queued successfully`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to process scheduled email:", error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue processors
// ─────────────────────────────────────────────────────────────────────────────
emailQueue.process("single-email", 5, processSingleEmail);
emailQueue.process("bulk-email", 2, processBulkEmail);
scheduledEmailQueue.process("scheduled-email", processScheduledEmail);

// Error / failure listeners
emailQueue.on("error", (error) => console.error("❌ Email queue error:", error));
emailQueue.on("failed", (job, err) => console.error(`❌ Email job ${job.id} failed:`, err.message));
scheduledEmailQueue.on("error", (error) => console.error("❌ Scheduled email queue error:", error));
scheduledEmailQueue.on("failed", (job, err) => console.error(`❌ Scheduled email job ${job.id} failed:`, err.message));

// Optional verbose logging (set ENABLE_QUEUE_LOGGING=true in .env)
if (process.env.ENABLE_QUEUE_LOGGING === "true") {
  console.log("⚠️ Queue logging enabled (debug mode)");
  emailQueue.on("completed", (job, result) => console.log(`✅ Email job ${job.id} completed:`, result.to));
  emailQueue.on("stalled", (job) => console.warn(`⚠️ Email job ${job.id} stalled`));
  scheduledEmailQueue.on("completed", (job, result) => console.log(`✅ Scheduled job ${job.id} completed:`, result.message));
  scheduledEmailQueue.on("stalled", (job) => console.warn(`⚠️ Scheduled job ${job.id} stalled`));
}

// Graceful shutdown
const closeQueues = async () => {
  await emailQueue.close();
  await scheduledEmailQueue.close();
  process.exit(0);
};
process.on("SIGTERM", closeQueues);
process.on("SIGINT", closeQueues);

console.log("✅ Email workers started successfully");

module.exports = { emailQueue, scheduledEmailQueue };