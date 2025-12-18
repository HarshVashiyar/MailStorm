const {
  sendOTP,
  verifyOTP,
  // sendMail
} = require("../utilities/mailUtil");
const { emailQueue, scheduledEmailQueue } = require("../config/queue");
const User = require("../models/userDB");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const handleSendOTP = async (req, res) => {
  const { email, isNew } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required!" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      if (!isNew) {
        return res.status(404).json({ success: false, message: "User with provided email not found!" });
      }
    } else {
      if (isNew) {
        return res.status(400).json({ success: false, message: "User with provided email already exists!" });
      }
    }
    const response = await sendOTP(email);
    return res.status(200).json({ success: true, message: "OTP sent successfully!", data: response });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

const handleVerifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }
  const response = verifyOTP(email, otp);
  return res.status(response.success ? 200 : 400).json(response);
};

const handleResetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Both new password and confirm password are required!" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match!" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    existingUser.password = newPassword;
    await existingUser.save();
    return res.status(200).json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

const handleSendMail = async (req, res) => {
  const { to, subject, recipientPeople, html } = req.body;
  const user = req.user;
  try {
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: "Recipient email(s), subject, and content are required.",
      });
    }

    const emailAddresses = to.split(",").map((mail) => mail.trim());
    const recipients = recipientPeople ? JSON.parse(recipientPeople) : [];
    
    // Prepare attachments from uploaded files
    const attachments = req.files?.map((file) => ({
      filename: file.originalname,
      content: file.buffer.toString('base64'),  // ← Convert to base64
      encoding: 'base64',                       // ← Tell nodemailer
      contentType: file.mimetype,               // ← Preserve type
    })) || [];

    // Prepare email data for queue
    const emails = emailAddresses.map((email, index) => ({
      to: email,
      recipientName: recipients[index] || 'User',
    }));

    // Add bulk email job to queue
    const job = await emailQueue.add(
      'bulk-email',
      {
        emails,
        subject,
        html,
        attachments,
        userId: user.id,
        from: process.env.MAIL_FROM_1,
      },
      {
        priority: 1, // High priority for direct sends
        attempts: 3,
      }
    );

    // Compute approximate queue position (Bull doesn't expose job.getPosition())
    let queuePosition = null;
    try {
      const waiting = await emailQueue.getWaiting();
      const idxWaiting = waiting.findIndex((j) => String(j.id) === String(job.id));
      if (idxWaiting !== -1) {
        queuePosition = idxWaiting;
      } else {
        const active = await emailQueue.getActive();
        const idxActive = active.findIndex((j) => String(j.id) === String(job.id));
        if (idxActive !== -1) {
          queuePosition = waiting.length + idxActive;
        } else {
          const delayed = await emailQueue.getDelayed();
          const idxDelayed = delayed.findIndex((j) => String(j.id) === String(job.id));
          if (idxDelayed !== -1) {
            queuePosition = waiting.length + active.length + idxDelayed;
          }
        }
      }
    } catch (posErr) {
      console.error('Error computing queue position:', posErr);
    }

    return res.status(200).json({
      success: true,
      message: `Email job queued successfully! ${emailAddresses.length} email(s) will be sent.`,
      jobId: job.id,
      totalEmails: emailAddresses.length,
      // queuePosition: job.getPosition,
      queuePosition,
    });
  } catch (error) {
    console.error("Error queuing emails:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to queue emails",
      error: error.message 
    });
  }
};

const handleGetQueueStats = async (req, res) => {
  try {
    const [
      emailWaiting,
      emailActive,
      emailCompleted,
      emailFailed,
      emailDelayed,
      scheduledWaiting,
      scheduledActive,
      scheduledCompleted,
      scheduledFailed,
      scheduledDelayed,
    ] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
      scheduledEmailQueue.getWaitingCount(),
      scheduledEmailQueue.getActiveCount(),
      scheduledEmailQueue.getCompletedCount(),
      scheduledEmailQueue.getFailedCount(),
      scheduledEmailQueue.getDelayedCount(),
    ]);
    
    res.json({
      success: true,
      queues: {
        email: {
          waiting: emailWaiting,
          active: emailActive,
          completed: emailCompleted,
          failed: emailFailed,
          delayed: emailDelayed,
          total: emailWaiting + emailActive + emailDelayed,
        },
        scheduled: {
          waiting: scheduledWaiting,
          active: scheduledActive,
          completed: scheduledCompleted,
          failed: scheduledFailed,
          delayed: scheduledDelayed,
          total: scheduledWaiting + scheduledActive + scheduledDelayed,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue statistics',
      error: error.message,
    });
  }
}

// ✨ NEW: Get job status
const handleGetJobStatus = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await emailQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const state = await job.getState();
    const progress = job.progress();
    const reason = job.failedReason;

    return res.status(200).json({
      success: true,
      job: {
        id: job.id,
        state,
        progress,
        failedReason: reason,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        data: {
          totalEmails: job.data.emails?.length || 1,
          subject: job.data.subject,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job status",
      error: error.message,
    });
  }
};

// ✨ NEW: Get user's job history
const handleGetJobHistory = async (req, res) => {
  const user = req.user;
  const { status = 'all', limit = 20 } = req.query;
  
  try {
    let jobs = [];
    
    if (status === 'completed' || status === 'all') {
      const completed = await emailQueue.getCompleted(0, limit);
      jobs = jobs.concat(completed);
    }
    
    if (status === 'failed' || status === 'all') {
      const failed = await emailQueue.getFailed(0, limit);
      jobs = jobs.concat(failed);
    }
    
    if (status === 'active' || status === 'all') {
      const active = await emailQueue.getActive(0, limit);
      jobs = jobs.concat(active);
    }
    
    if (status === 'waiting' || status === 'all') {
      const waiting = await emailQueue.getWaiting(0, limit);
      jobs = jobs.concat(waiting);
    }

    // Filter jobs by userId
    const userJobs = jobs.filter(job => job.data.userId === user.id);

    const jobsData = await Promise.all(
      userJobs.map(async (job) => ({
        id: job.id,
        state: await job.getState(),
        progress: job.progress(),
        data: {
          subject: job.data.subject,
          totalEmails: job.data.emails?.length || 1,
        },
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }))
    );

    return res.status(200).json({
      success: true,
      jobs: jobsData,
      total: jobsData.length,
    });
  } catch (error) {
    console.error("Error fetching job history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job history",
      error: error.message,
    });
  }
};

// ✨ NEW: Retry failed job
const handleRetryJob = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await emailQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const state = await job.getState();
    
    if (state !== 'failed') {
      return res.status(400).json({
        success: false,
        message: `Job is ${state}, can only retry failed jobs`
      });
    }

    await job.retry();

    return res.status(200).json({
      success: true,
      message: "Job queued for retry",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error retrying job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retry job",
      error: error.message,
    });
  }
};
// const handleSendMail = async (req, res) => {
//   const { to, subject, recipientPeople, html } = req.body;
//   try {
//     if (!to || !subject || !html) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Recipient email(s), subject, and content are required.",
//       });
//     }
//     const emailAddresses = to.split(",").map((mail) => mail.trim());
//     const attachments = req.files.map((file) => ({
//       filename: file.originalname,
//       content: file.buffer,
//     }));
//     const mailContent = {
//       to: emailAddresses,
//       subject,
//       recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
//       html,
//       attachments,
//     };
//     const response = await sendMail(mailContent);
//     return res.status(response.success ? 200 : 500).json(response);
//   } catch (error) {
//     console.error("Error in handleSendMail:", error);
//     return res.status(500).json({ success: false, message: + error.message });
//   }
// }

const handleEnhanceSubject = async (req, res) => {
  const { subject, formalityLevel } = req.body;
  try {
    if (!subject || !formalityLevel) {
      res.status(400).send({ success: false, message: "Please provide the subject to be enhanced!" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user", parts: [
            {
              text: `Enhance the following email subject by improving its clarity, tone, and professionalism while STRICTLY PRESERVING the original intent, meaning, and action/purpose.

⚠️ CRITICAL: DO NOT change the core action or purpose:
• If the subject is about "finalizing" something, keep it about finalizing (not "inquiring" or "requesting")
• If it's about "requesting" something, keep it about requesting (not "confirming" or "finalizing")
• If it's about "following up", keep it about following up (not "initiating" or "inquiring")
• Preserve the original intent completely - only improve the wording, clarity, and professionalism

Rewrite it as one single, concise, and contextually appropriate subject line suitable for a ${formalityLevel} email.

Output only the final enhanced subject line, without any explanation, alternatives, or commentary.

Original Subject: ${subject}` }
          ]
        }
      ]
    });
    const candidates = response.candidates;
    const enhancedSubject = candidates?.[0]?.content?.parts?.[0]?.text || "Upgrade to pro to get AI suggestions";
    return res.status(200).json({ success: true, message: "Subject Enhanced Successfully!", enhancedSubject });
  } catch (error) {
    console.error("Error enhancing the subject:", error);
    if (
      error.message &&
      error.message.includes("503") &&
      error.message.includes("The model is overloaded")
    ) {
      return res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again in a few seconds." });
    }
    return res.status(500).json({ success: false, message: "Internal server error while enhancing the subject!" });
  }
}

const handleGenerateHTMLBody = async (req, res) => {
  const { enhancedSubject, formalityLevel } = req.body;
  try {
    if (!enhancedSubject || !formalityLevel) {
      res.status(400).send({ success: false, message: "Please provide the subject for which the content has to be generated!" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user", parts: [
            {
              text: `Generate a complete, human-written email body in valid HTML for the following subject: "${enhancedSubject}", written at a ${formalityLevel} tone.

📋 CONTENT GUIDELINES:
• Write naturally and conversationally - this should sound like a real person wrote it
• Use square brackets [] ONLY for user-specific details that the sender must fill in (e.g., [Your Name], [Your Title], [Your Company], [Recipient Name], [Specific Date/Time])
• For generic content, write complete sentences without placeholders (e.g., use actual example product names, realistic scenarios)
• Balance is key: Keep essential user details as [], but make the email body naturally readable
• Include a proper greeting (e.g., "Hi," / "Dear Team," / "Hello,") and closing (e.g., "Best regards," / "Thanks," / "Cheers,")
• Make the body relevant and contextual to the subject
• Length: 3-6 well-structured paragraphs depending on formality

🎨 FORMATTING GUIDELINES:
Use these HTML tags creatively based on formality level:
• <b> (bold), <i> (italic), <u> (underline), <s> (strikethrough)
• <blockquote> for important notes or quotes
• <a href="..."> for links (use realistic URLs like "https://example.com")
• <span style="color: #hexcode"> for colored text
• <p align="left|center|right|justify"> for paragraphs
• <h1>, <h2>, <h3> for headings
• <ul>, <ol>, <li> for lists when appropriate

Formatting intensity by formality level:
• INFORMAL: Use MORE formatting - mix colors, bold/italic emphasis, emojis in text if appropriate, creative alignment, blockquotes for emphasis
• NEUTRAL: Use MODERATE formatting - occasional bold for key points, standard structure
• FORMAL: Use MINIMAL formatting - professional structure, bold only for critical items, conservative colors

⚠️ CRITICAL OUTPUT REQUIREMENTS:
1. Output ONLY the HTML code - no markdown code blocks, no \`\`\`html, no \`\`\`, no backticks
2. Start directly with HTML tags (e.g., <p>, <h2>, etc.)
3. No explanations, commentary, or text before/after the HTML
4. No leading or trailing blank lines
5. Do not wrap the output in markdown formatting
6. Make it sound human and natural - avoid robotic or template-like language

Output the raw HTML directly now.` }
          ]
        }
      ]
    });
    const candidates = response.candidates;
    let HTMLContent = candidates?.[0]?.content?.parts?.[0]?.text || "Upgrade to pro to get AI suggestions";
    
    // Clean up any markdown code blocks that might be in the response
    HTMLContent = HTMLContent.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/g, '').trim();
    
    return res.status(200).json({ success: true, message: "Email Content Generated Successfully!", HTMLContent });
  } catch (error) {
    console.error("Error enhancing the subject:", error);
    if (
      error.message &&
      error.message.includes("503") &&
      error.message.includes("The model is overloaded")
    ) {
      return res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again in a few seconds." });
    }
    return res.status(500).json({ success: false, message: "Internal server error while enhancing the subject!" });
  }
}

module.exports = {
  handleSendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
  handleGetQueueStats,
  handleGetJobStatus,
  handleGetJobHistory,
  handleRetryJob,
  handleEnhanceSubject,
  handleGenerateHTMLBody
}