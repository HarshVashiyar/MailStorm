const {
  sendOTP,
  verifyOTP
} = require("../utilities/mailUtil");

const User = require("../models/userDB");

const handleSendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // const { newUser } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required!" });
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User with provided email not found!" });
    }
    // if(!newUser){
    //     if (!existingUser) {
    //         return res.status(404).json({ success: false, message: "User with provided email not found!" });
    //     }
    // }
    const response = await sendOTP(email);
    return res.status(200).json({ success: true, message: "OTP sent successfully!", data: response });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

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
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

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

    const emailAddresses = to.split(",").map((mail) => mail.trim());

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    const mailContent = {
      to: emailAddresses,
      subject,
      recipientPeople: recipientPeople ? JSON.parse(recipientPeople) : [],
      text,
      html,
      attachments,
      signature,
      mState,
    };

    const response = await sendMail(mailContent);
    return res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    console.error("Error in handleSendMail:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

module.exports = {
  handleSendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail
}