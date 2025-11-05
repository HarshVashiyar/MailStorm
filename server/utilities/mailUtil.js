require("dotenv").config();
const nodemailer = require("nodemailer");

const otpStorage = {};
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

const sendOTP = async (mail) => {
  const otp = generateOTP();
  const expirationTime = Date.now() + 152 * 1000;
  otpStorage[mail] = { otp, expirationTime };
  const content = {
    to: mail,
    subject: 'Your One-Time Password (OTP) for Email Verification',
    html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #f9f9f9;">
                <h2 style="color: #333;">Email Verification</h2>
                <p style="font-size: 18px; color: #555;">Use the following OTP to verify your email address:</p>
                <div style="margin: 30px auto; display: inline-block; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 30px 50px;">
                    <span style="font-size: 48px; letter-spacing: 12px; font-weight: bold; color: #2d8cf0;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 14px; margin-top: 30px;">This OTP will expire in 150 seconds.</p>
            </div>
        `,
  };
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.ADMIN_MAIL_PASSWORD,
    },
  });
  try {
    const response = await transporter.sendMail(content);
    return { expirationTime };
  } catch (error) {
    console.error(`Error sending OTP to ${mail}:`, error);
    throw new Error('Failed to send OTP');
  }
}

const verifyOTP = (mail, otp) => {
  // Validate OTP format and length
  if (!otp || typeof otp !== 'string' && typeof otp !== 'number') {
    return { success: false, message: "OTP is required!" };
  }
  
  const otpString = String(otp);
  if (otpString.length !== 6) {
    return { success: false, message: "OTP must be exactly 6 digits!" };
  }
  
  if (!/^\d{6}$/.test(otpString)) {
    return { success: false, message: "OTP must contain only digits!" };
  }
  
  const otpData = otpStorage[mail];
  if (!otpData) {
    return { success: false, message: "OTP not found!" };
  }
  if (Date.now() > otpData.expirationTime) {
    delete otpStorage[mail];
    return { success: false, message: "OTP expired!" };
  }
  if (otpData.otp != otp) {
    return { success: false, message: "Invalid OTP!" };
  }
  delete otpStorage[mail];
  return { success: true, message: "OTP verified successfully" };
};

const sendScheduledMail = async ({
  to,
  recipientPeople,
  subject,
  html,
  attachments,
}) => {
  try {
    const MAIL_USER = process.env.MAIL_USER_1;
    const MAIL_PASS = process.env.MAIL_PASS_1;
    const MAIL_FROM = process.env.MAIL_FROM_1;
    if (to.length !== recipientPeople.length) {
      recipientPeople = [];
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });
    const promises = to.map((mail, index) => {
      const recipientName = recipientPeople[index] || "User";
      return transporter.sendMail({
        from: `${MAIL_FROM} <${MAIL_USER}>`,
        to: mail,
        subject,
        html: `<p>Dear ${recipientName},</p>${html}`,
        attachments: attachments || [],
      });
    });
    await Promise.all(promises);
    return { success: true, message: "Mail(s) sent successfully!" };
  } catch (error) {
    console.error("Error sending mail:", error);
    return { success: false, message: "Failed to send mails. Please try again later.", error: error.message };
  }
};

const sendMail = async ({
  to,
  recipientPeople,
  subject,
  html,
  attachments,
}) => {
  const MAIL_USER = process.env.MAIL_USER_1;
  const MAIL_PASS = process.env.MAIL_PASS_1;
  const MAIL_FROM = process.env.MAIL_FROM_1;
  try {
    if (to.length !== recipientPeople.length) {
      recipientPeople = [];
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
    const promises = to.map((mail, index) => {
      const recipientName = recipientPeople[index] || "User";
      return transporter.sendMail({
        from: `${MAIL_FROM} <${MAIL_USER}>`,
        to: mail,
        subject,
        html: `<p>Dear ${recipientName},</p>${html}`,
        attachments: attachments || [],
      });
    });
    await Promise.all(promises);
    return { success: true, message: "Mail(s) sent successfully!" };
  } catch (error) {
    console.error("Error sending mail:", error);
    return {
      success: false,
      message: "Failed to send mails. Please try again later.",
    };
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  sendScheduledMail,
  sendMail
}