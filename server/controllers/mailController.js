const {
  sendOTP,
  verifyOTP,
} = require("../utilities/mailUtil");
const { emailQueue } = require("../config/queue");
const User = require("../models/userDB");
const BulkEmailJob = require('../models/bulkEmailJobDB');
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const SmtpAccount = require('../models/SmtpAccount');
const smtpUtil = require('../utilities/smtpUtil');
const { uploadMultipleToCloudinary } = require('../utilities/cloudinary');

// ✅ DYNAMIC STORAGE: Threshold for Cloudinary upload (7MB)
const REDIS_SIZE_THRESHOLD = 7 * 1024 * 1024; // 7MB

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

const handleVerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }
  const response = await verifyOTP(email, otp);
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
  const { to, subject, recipientPeople, html, smtpSlotId, prefix, suffix } = req.body;
  const user = req.user;
  try {
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: "Recipient email(s), subject, and content are required.",
      });
    }
    // Validate SMTP slot selection
    if (!smtpSlotId) {
      return res.status(400).json({
        success: false,
        message: "Please select an email account (SMTP slot) to send from.",
      });
    }

    const smtpAccount = await SmtpAccount.findOne({
      _id: smtpSlotId,
      userId: user.id,
    });

    if (!smtpAccount) {
      return res.status(404).json({
        success: false,
        message: "Selected email account not found.",
      });
    }
    // Check if account can send emails
    if (!smtpUtil.canSendEmail(smtpAccount)) {
      return res.status(400).json({
        success: false,
        message: `Cannot send from this account. Status: ${smtpAccount.status}, Daily limit: ${smtpAccount.emailsSentToday}/${smtpAccount.dailyLimit}`,
      });
    }

    const emailAddresses = to.split(",").map((mail) => mail.trim());
    const recipients = recipientPeople ? JSON.parse(recipientPeople) : [];
    // Check if total emails exceed remaining limit
    const remainingLimit = smtpAccount.dailyLimit - smtpAccount.emailsSentToday;
    if (emailAddresses.length > remainingLimit) {
      return res.status(400).json({
        success: false,
        message: `Cannot send ${emailAddresses.length} emails. Only ${remainingLimit} emails remaining in daily limit.`,
      });
    }

    // Look up caller's skipUnsubscribed preference
    const userDoc = await User.findById(user.id).select('skipUnsubscribed').lean();
    const skipUnsubscribed = userDoc?.skipUnsubscribed ?? false;

    // ✅ DYNAMIC STORAGE: Calculate total attachment size
    let totalAttachmentSize = 0;
    req.files?.forEach(file => {
      totalAttachmentSize += file.buffer.length;
    });

    let attachments = [];
    let storageMethod = 'none';

    if (req.files && req.files.length > 0) {
      // ✅ DYNAMIC STORAGE: Decide storage method based on size
      if (totalAttachmentSize >= REDIS_SIZE_THRESHOLD) {
        // LARGE ATTACHMENTS: Upload to Cloudinary
        console.log(`📤 Uploading ${req.files.length} large attachment(s) to Cloudinary (${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB)`);

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
        // SMALL ATTACHMENTS: Store as base64 in Redis
        console.log(`💾 Storing ${req.files.length} small attachment(s) in Redis (${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB)`);

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

    // Prepare email data for queue
    const emails = emailAddresses.map((email, index) => ({
      to: email,
      recipientName: recipients[index] || 'User',
    }));

    // Append signature to email body if exists
    let finalHtml = html;
    if (smtpAccount.signature) {
      // Add a separator line before signature
      finalHtml = `${html}<br/><br/>--<br/>${smtpAccount.signature}`;
    }

    // Create BulkEmailJob document so the worker can track per-recipient outcomes
    const bulkJob = await BulkEmailJob.create({
      userId: user.id,
      subject,
      from: smtpAccount.email,
      smtpAccountId: smtpAccount._id,
      totalRecipients: emailAddresses.length,
      status: 'queued',
    });

    // Add bulk email job to queue
    const job = await emailQueue.add(
      'bulk-email',
      {
        emails,
        subject,
        html: finalHtml,
        attachments,
        userId: user.id,
        smtpAccountId: smtpAccount._id.toString(),
        bulkJobId: bulkJob._id.toString(), // ← tracked for delivery log
        skipUnsubscribed,
        prefix,
        suffix,
      },
      {
        priority: 1,
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    // If queuing fails the catch block below will mark the job as failed
    return res.status(200).json({
      success: true,
      message: `${emailAddresses.length} email(s) queued successfully from ${smtpAccount.email}.`,
      totalEmails: emailAddresses.length,
      smtpAccount: {
        email: smtpAccount.email,
        provider: smtpAccount.provider,
      },
      attachmentInfo: attachments.length > 0 ? {
        count: attachments.length,
        totalSize: `${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB`,
        storageMethod,
      } : null,
    });
  } catch (error) {
    console.error("Error queuing emails:", error);

    // Check if it's a Redis size error
    if (error.message && error.message.includes('max request size exceeded')) {
      return res.status(400).json({
        success: false,
        message: 'Attachments are too large for queue processing. This should not happen with dynamic storage. Please contact support.',
        error: 'Redis size limit exceeded',
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to queue emails",
      error: error.message
    });
  }
};

const handleEnhanceSubject = async (req, res) => {
  const { subject, formalityLevel } = req.body;
  try {
    if (!subject || !formalityLevel) {
      res.status(400).send({ success: false, message: "Please provide the subject to be enhanced!" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

Original Subject: ${subject}`
            }
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
      model: "gemini-2.5-flash",
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
  handleEnhanceSubject,
  handleGenerateHTMLBody,
  // DEBUG ENDPOINTS - Moved to debugController.js
  // handleGetQueueStats,
  // handleGetJobStatus,
  // handleGetJobHistory,
  // handleRetryJob,
};