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
    from: process.env.ADMIN_MAIL,
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
    host: process.env.ADMIN_SMTP_HOST,
    port: 465,
    secure: true, // SSL
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

const sendSuspensionEmail = async (email, fullName, reason) => {
  const ADMIN_MAIL = process.env.ADMIN_MAIL;
  const ADMIN_MAIL_PASSWORD = process.env.ADMIN_MAIL_PASSWORD;
  const ADMIN_MAIL_FROM = process.env.ADMIN_MAIL_FROM || 'MailStorm';
  
  const transporter = nodemailer.createTransport({
    host: process.env.ADMIN_SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: ADMIN_MAIL,
      pass: ADMIN_MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${ADMIN_MAIL_FROM} <${ADMIN_MAIL}>`,
    to: email,
    subject: 'Account Suspension Notice - MailStorm',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 20px; border-radius: 10px;">
                <h1 style="color: white; margin: 0;">Account Suspended</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px;">
                <p>Dear ${fullName},</p>
                <p>We regret to inform you that your MailStorm account has been <strong>suspended</strong>.</p>
                <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <strong style="color: #dc2626;">Reason for suspension:</strong>
                    <p style="margin: 5px 0 0 0;">${reason}</p>
                </div>
                <p>This action was taken because you were found emailing recipients without their consent or violating our Privacy Policy or Terms of Service.</p>
                <p>If you believe this suspension is a mistake or would like to appeal, please contact our support team.</p>
                <p style="margin-top: 30px;">Best regards,<br/>MailStorm Team</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Suspension email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send suspension email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

const sendUnsuspensionEmail = async (email, fullName) => {
  const ADMIN_MAIL = process.env.ADMIN_MAIL;
  const ADMIN_MAIL_PASSWORD = process.env.ADMIN_MAIL_PASSWORD;
  const ADMIN_MAIL_FROM = process.env.ADMIN_MAIL_FROM || 'MailStorm';
  
  const transporter = nodemailer.createTransport({
    host: process.env.ADMIN_SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: ADMIN_MAIL,
      pass: ADMIN_MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${ADMIN_MAIL_FROM} <${ADMIN_MAIL}>`,
    to: email,
    subject: 'Account Reactivated - MailStorm',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #22c55e, #16a34a); padding: 20px; border-radius: 10px;">
                <h1 style="color: white; margin: 0;">Account Reactivated</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px;">
                <p>Dear ${fullName},</p>
                <p>Great news! Your MailStorm account has been <strong>reactivated</strong> and you can now access all features again.</p>
                <p>Please ensure to comply with our Terms of Service and Privacy Policy when using the platform.</p>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p style="margin-top: 30px;">Best regards,<br/>MailStorm Team</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send unsuspension email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  sendScheduledMail,
  sendMail,
  sendSuspensionEmail,
  sendUnsuspensionEmail
}