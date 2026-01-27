const ScheduledMail = require("../models/scheduledMailDB");
const { scheduledEmailQueue } = require("../config/queue");
const moment = require("moment-timezone");
const { uploadMultipleToCloudinary } = require('../utilities/cloudinary');

// ✅ DYNAMIC STORAGE: Threshold for Cloudinary upload (7MB)
const REDIS_SIZE_THRESHOLD = 7 * 1024 * 1024; // 7MB

// ✨ NEW: Queue-based scheduled email (no more cron!)
// cron.schedule("* * * * *", async () => {
//   const now = new Date();
//   const mailsToSend = await ScheduledMail.find({
//     sendAt: { $lte: now },
//     status: "Pending",
//   });
//   mailsToSend.forEach(async (mail, index) => {
//     try {
//       const mailContent = {
//         to: mail.to,
//         subject: mail.subject,
//         recipientPeople: mail.recipientPeople ? mail.recipientPeople : null,
//         html: mail.html || null,
//         signature: mail.signature || null,
//         attachments: mail.attachments.map((att) => ({
//           filename: att.filename,
//           path: att.path,
//           contentType: att.contentType,
//         }))
//       };
//       await sendScheduledMail(mailContent);
//       mail.status = "Sent";
//       await mail.save();
//     } catch (err) {
//       console.error("Mail sending failed:", err);
//     }
//   });
// });

const handleAddScheduledMail = async (req, res) => {
  const user = req.user;
  // console.log("user: ", user);
  try {
    const {
      to,
      subject,
      recipientPeople,
      html,
      signature,
      sendAt,
      status,
      timeZone,
      smtpSlotId,
    } = req.body;

    // Validate SMTP slot
    if (!smtpSlotId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an email account to send from'
      });
    }

    const SmtpAccount = require('../models/SmtpAccount');
    const smtpAccount = await SmtpAccount.findOne({
      _id: smtpSlotId,
      userId: user.id,
    });

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: 'Selected email account not found'
      });
    }

    if (!sendAt || !timeZone) {
      return res.status(400).json({
        success: false,
        message: 'Missing Send-time and/or Time-zone!'
      });
    }

    const utcSendAt = moment.tz(sendAt, timeZone).utc().toDate();

    // Check if the scheduled time is in the past
    if (utcSendAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    // ✅ DYNAMIC STORAGE: Calculate total attachment size
    let totalAttachmentSize = 0;
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        totalAttachmentSize += file.size || file.buffer?.length || 0;
      });
    }

    let attachments = [];
    let storageMethod = 'none';

    if (req.files && req.files.length > 0) {
      // ✅ DYNAMIC STORAGE: Decide storage method based on size
      if (totalAttachmentSize >= REDIS_SIZE_THRESHOLD) {
        // LARGE ATTACHMENTS: Upload to Cloudinary
        console.log(`📤 Uploading ${req.files.length} large attachment(s) to Cloudinary for scheduled mail (${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB)`);

        try {
          attachments = await uploadMultipleToCloudinary(req.files);
          storageMethod = 'cloudinary';
        } catch (uploadError) {
          console.error('Failed to upload attachments to Cloudinary:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload attachments to cloud storage. Please try again.',
            error: uploadError.message,
          });
        }
      } else {
        // SMALL ATTACHMENTS: Store as base64 (will be in Redis via queue)
        console.log(`💾 Storing ${req.files.length} small attachment(s) for scheduled mail (${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB)`);

        attachments = req.files.map((file) => ({
          filename: file.originalname,
          content: file.buffer.toString('base64'),
          encoding: 'base64',
          contentType: file.mimetype,
          size: file.size,
          storedIn: 'redis', // ✅ Flag to indicate storage location
        }));
        storageMethod = 'redis';
      }
    }

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: "to" and "subject".'
      });
    }

    if (!Array.isArray(to) && typeof to !== 'string') {
      return res.status(400).json({
        success: false,
        message: '"to" must be a comma-separated string of emails',
      });
    }

    // Save to database - attachments are either URLs (cloudinary) or base64 (redis)
    const newScheduledMail = await ScheduledMail.create({
      from: smtpAccount.email,  // Use selected account's email
      to: to
        .split(",")
        .map(email => email?.toString().trim())
        .filter(Boolean),
      subject,
      recipientPeople: Array.isArray(recipientPeople)
        ? recipientPeople
        : recipientPeople
          ? JSON.parse(recipientPeople)
          : [],
      html,
      attachments, // Either base64 or Cloudinary URLs
      signature,
      sendAt: utcSendAt,
      status: 'Pending',
      createdBy: user.id,
      smtpAccountId: smtpAccount._id,
      // REMOVED: jobId field - not needed, saves 1 write per scheduled mail
    });

    // Calculate delay in milliseconds
    const delay = utcSendAt.getTime() - Date.now();
    // console.log("before adding to queue");

    // Add job to queue with delay
    const job = await scheduledEmailQueue.add(
      'scheduled-email',
      {
        scheduledMailId: newScheduledMail._id,
        to: newScheduledMail.to,
        recipientPeople: newScheduledMail.recipientPeople,
        subject: newScheduledMail.subject,
        html: newScheduledMail.html,
        attachments: newScheduledMail.attachments, // Pass as-is (URLs or base64)
        smtpAccountId: smtpAccount._id.toString(),
        userId: user.id,
      },
      {
        delay, // Schedule the job
        attempts: 3,
        removeOnComplete: true, // ✅ OPTIMIZED: Auto-cleanup completed jobs
        removeOnFail: false, // Keep failed jobs for debugging
      }
    );

    // REMOVED: Storing jobId in database - not needed for production
    // If you need to cancel jobs, use scheduledMailId to query the database status instead

    res.status(201).json({
      success: true,
      message: "Mail scheduled successfully.",
      data: {
        scheduledMail: newScheduledMail,
        // jobId: job.id, // COMMENTED OUT - not needed by frontend
        scheduledFor: utcSendAt,
        // ✅ INFO: Include storage method for debugging
        attachmentInfo: Array.isArray(attachments) && attachments.length > 0 ? {
          count: attachments.length,
          totalSize: `${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB`,
          storageMethod, // 'redis', 'cloudinary', or 'none'
        } : null,
      }
    });
  } catch (error) {
    console.error("Error in handleAddScheduledMail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleGetScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    // OPTIMIZED: Simple query without job status enrichment
    // This saves N Redis reads (where N = number of scheduled mails)
    const scheduledMails = await ScheduledMail.find({ createdBy: user.id });

    // REMOVED: Job status enrichment
    // If you need to check job status for debugging, use the debug endpoints
    // Old code was doing:
    // - await scheduledEmailQueue.getJob(mail.jobId) for each mail
    // - await job.getState() for each job
    // This caused 2N Redis reads per request

    res.status(200).json({
      success: true,
      message: "Scheduled mails retrieved successfully.",
      data: scheduledMails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleDeleteScheduledMails = async (req, res) => {
  const user = req.user;
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No scheduled mails selected"
      });
    }

    // OPTIMIZED: Since we're not storing jobId anymore and using removeOnComplete: true,
    // we don't need to manually remove jobs from the queue.
    // Jobs will auto-delete after completion.
    // For pending jobs, they'll remain in queue but the scheduledMailId check will fail gracefully.

    // REMOVED: Manual job removal from queue
    // Old code:
    // for (const mail of scheduledMails) {
    //   if (mail.jobId) {
    //     const job = await scheduledEmailQueue.getJob(mail.jobId);
    //     if (job) await job.remove();
    //   }
    // }
    // This was causing 2N Redis operations per deletion

    // Note: If a scheduled job fires after deletion, the worker will handle the missing
    // scheduledMailId gracefully (the ScheduledMail.findByIdAndUpdate will return null)

    // Delete from database
    const deletedScheduledMails = await ScheduledMail.deleteMany({
      _id: { $in: ids },
      createdBy: user.id,
    });

    if (deletedScheduledMails.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: `${deletedScheduledMails.deletedCount} scheduled mail(s) deleted successfully`
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No mails found to delete"
      });
    }
  } catch (err) {
    console.error("Remove scheduled mails error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// REMOVED: handleUpdateScheduledMail
// ========================================
// This function was commented out in original code
// If you need to implement updates in the future, remember to:
// 1. Not store jobId in database
// 2. Use removeOnComplete: true for new jobs
// 3. Update database record without querying Redis

module.exports = {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
};