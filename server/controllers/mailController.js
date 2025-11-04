const {
  sendOTP,
  verifyOTP,
  sendMail
} = require("../utilities/mailUtil");
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
  try {
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message:
          "Recipient email(s), subject, and content are required.",
      });
    }
    const emailAddresses = to.split(",").map((mail) => mail.trim());
    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));
    const mailContent = {
      to: emailAddresses,
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      html,
      attachments,
    };
    const response = await sendMail(mailContent);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error in handleSendMail:", error);
    return res.status(500).json({ success: false, message: + error.message });
  }
}

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
  handleEnhanceSubject,
  handleGenerateHTMLBody
}