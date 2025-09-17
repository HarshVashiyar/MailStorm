const User = require("../models/userDB");
const { sendOTP, sendEmail, verifyOTP } = require("../utilities/mailUtil");

const sendOTPController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const response = await sendOTP(email);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error in sendOTPController:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
  }
};

const handleVerifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  const response = verifyOTP(email, otp);
  return res.status(response.success ? 200 : 400).json(response);
};

const handleResetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error in handleResetPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating password." });
  }
};

const handleSendMail = async (req, res) => {
  try {
    const { to, subject, recipientPeople, text, html, signature, mState } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message:
          "Recipient email(s), subject, and either text or HTML content are required.",
      });
    }

    const emailAddresses = to.split(",").map((email) => email.trim());

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    const emailContent = {
      to: emailAddresses,
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      text,
      html,
      attachments,
      signature,
      mState,
    };

    const response = await sendEmail(emailContent);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error in handleSendMail:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  sendOTP: sendOTPController,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
};
