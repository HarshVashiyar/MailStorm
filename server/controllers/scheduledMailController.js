const ScheduledMail = require("../models/scheduledMailDB");
const { scheduledEmailQueue } = require("../config/queue");
const moment = require("moment-timezone");

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
  console.log("user: ", user);
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
    } = req.body;
    
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
    
    const attachments = req.files?.map((file) => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    })) || [];
    
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: "to" and "subject".' 
      });
    }
    
    // Save to database
    const newScheduledMail = await ScheduledMail.create({
      from: "dynamictechnocast@gmail.com",
      to: to.split(",").map(email => email.trim()),
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      html,
      attachments,
      signature,
      sendAt: utcSendAt,
      status: 'Pending',
      createdBy: user.id,
    });
    
    // Calculate delay in milliseconds
    const delay = utcSendAt.getTime() - Date.now();
    console.log("before adding to queue");
    // Add job to queue with delay
    const job = await scheduledEmailQueue.add(
      'scheduled-email',
      {
        scheduledMailId: newScheduledMail._id,
        to: newScheduledMail.to,
        recipientPeople: newScheduledMail.recipientPeople,
        subject: newScheduledMail.subject,
        html: newScheduledMail.html,
        attachments: newScheduledMail.attachments.map((att) => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        })),
        userId: user.id,
      },
      {
        delay, // Schedule the job
        attempts: 3,
        removeOnComplete: false, // Keep for history
      }
    );
    
    // Store job ID in database for reference
    newScheduledMail.jobId = job.id;
    await newScheduledMail.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Mail scheduled successfully.",
      data: {
        scheduledMail: newScheduledMail,
        jobId: job.id,
        scheduledFor: utcSendAt,
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
    const scheduledMails = await ScheduledMail.find({ createdBy: user.id });
    
    // Enrich with job status if jobId exists
    const enrichedMails = await Promise.all(
      scheduledMails.map(async (mail) => {
        const mailObj = mail.toObject();
        
        if (mail.jobId) {
          try {
            const job = await scheduledEmailQueue.getJob(mail.jobId);
            if (job) {
              mailObj.jobStatus = {
                state: await job.getState(),
                progress: job.progress(),
                failedReason: job.failedReason,
              };
            }
          } catch (err) {
            console.error(`Error fetching job ${mail.jobId}:`, err.message);
          }
        }
        
        return mailObj;
      })
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Scheduled mails retrieved successfully.", 
      data: enrichedMails 
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
    
    // Find scheduled mails to get job IDs
    const scheduledMails = await ScheduledMail.find({
      _id: { $in: ids },
      createdBy: user.id,
    });
    
    // Remove jobs from queue
    for (const mail of scheduledMails) {
      if (mail.jobId) {
        try {
          const job = await scheduledEmailQueue.getJob(mail.jobId);
          if (job) {
            const state = await job.getState();
            // Only remove if job is waiting or delayed
            if (state === 'waiting' || state === 'delayed') {
              await job.remove();
              console.log(`Removed job ${mail.jobId} from queue`);
            }
          }
        } catch (err) {
          console.error(`Error removing job ${mail.jobId}:`, err.message);
        }
      }
    }
    
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

// const handleUpdateScheduledMail = async (req, res) => {
//   const user = req.user;
//   const { id, sendAt, timeZone, subject, html } = req.body;
  
//   try {
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Scheduled mail ID is required"
//       });
//     }
    
//     const scheduledMail = await ScheduledMail.findOne({
//       _id: id,
//       createdBy: user.id,
//     });
    
//     if (!scheduledMail) {
//       return res.status(404).json({
//         success: false,
//         message: "Scheduled mail not found"
//       });
//     }
    
//     // If already sent, can't update
//     if (scheduledMail.status === 'Sent') {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot update a mail that has already been sent"
//       });
//     }
    
//     // Remove old job from queue
//     if (scheduledMail.jobId) {
//       try {
//         const oldJob = await scheduledEmailQueue.getJob(scheduledMail.jobId);
//         if (oldJob) {
//           await oldJob.remove();
//         }
//       } catch (err) {
//         console.error(`Error removing old job:`, err.message);
//       }
//     }
    
//     // Update fields
//     if (sendAt && timeZone) {
//       const utcSendAt = moment.tz(sendAt, timeZone).utc().toDate();
      
//       if (utcSendAt < new Date()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Scheduled time must be in the future'
//         });
//       }
      
//       scheduledMail.sendAt = utcSendAt;
//     }
    
//     if (subject) scheduledMail.subject = subject;
//     if (html) scheduledMail.html = html;
    
//     // Create new job with updated time
//     const delay = scheduledMail.sendAt.getTime() - Date.now();
    
//     const newJob = await scheduledEmailQueue.add(
//       'scheduled-email',
//       {
//         scheduledMailId: scheduledMail._id,
//         to: scheduledMail.to,
//         recipientPeople: scheduledMail.recipientPeople,
//         subject: scheduledMail.subject,
//         html: scheduledMail.html,
//         attachments: scheduledMail.attachments,
//         userId: user.id,
//       },
//       {
//         delay,
//         attempts: 3,
//         removeOnComplete: false,
//       }
//     );
    
//     scheduledMail.jobId = newJob.id;
//     await scheduledMail.save();
    
//     return res.status(200).json({
//       success: true,
//       message: "Scheduled mail updated successfully",
//       data: scheduledMail,
//     });
//   } catch (error) {
//     console.error("Error updating scheduled mail:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

module.exports = {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
  // handleUpdateScheduledMail,
};