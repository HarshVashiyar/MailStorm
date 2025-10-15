require("dotenv").config();
// const { sign } = require("crypto");
const nodemailer = require("nodemailer");
// const path = require("path");
const { google } = require("googleapis");
const EmailProvider = require("../models/mailProviderDB");
const bcrypt = require("bcrypt");

const otpStorage = {};

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

const sendOTP = async (mail) => {
  const otp = generateOTP();
  const expirationTime = Date.now() + 150 * 1000;
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
  text,
  html,
  attachments,
  signature,
  mState,
}) => {
  try {
    const MAIL_USER = mState
      ? process.env.MAIL_USER_1
      : process.env.MAIL_USER_2;
    const MAIL_PASS = mState
      ? process.env.MAIL_PASS_1
      : process.env.MAIL_PASS_2;
    const MAIL_FROM = mState
      ? process.env.MAIL_FROM_1
      : process.env.MAIL_FROM_2;

    signature = mState
      ? `<div>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Gopal Vashiyar</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'><i>Sales Executive</i></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Mobile: +91-9979851555</p><br><br>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#833c0b;margin:0px;padding:0px'><b>Dynamic Technocast</b></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Survey No. 194, Plot No.50, Ishwar Industrial Area,</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Kothariya Solavant, Rajkot – 3600229 (Gujarat State) INDIA</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Web:</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Foundry Unit: <a href="https://www.dynamictechnocast.com/" target="_blank">https://dynamictechnocast.com/</a></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Machining Unit: <a href="https://www.dynamicprecisionindustries.com/" target="_blank">https://www.dynamicprecisionindustries.com/</a></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Email: <a href="mailto:dynamictechnocast@gmail.com" target="_blank">dynamictechnocast@gmail.com</a> / <a href="mailto:sales@dynamictechnocast.com" target="_blank">sales@dynamictechnocast.com</a></p>
        </div>`
      : `<div>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Gopal Vashiyar</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'><i>Sales Executive</i></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Mobile: +91-9979851555</p><br><br>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#833c0b;margin:0px;padding:0px'><b>Dynamic Precision Industries</b></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>3652, N Road, Phase III Industrial Area, Dared GIDC,</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Jamnagar – 361 004. (Gujarat State) INDIA</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Web:</p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Foundry Unit: <a href="https://www.dynamictechnocast.com/" target="_blank">https://dynamictechnocast.com/</a></p>
          <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Machining Unit: <a href="https://www.dynamicprecisionindustries.com/" target="_blank">https://www.dynamicprecisionindustries.com/</a></p><p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Email: <a href="mailto:sales@dynamicprecisionindustries.com" target="_blank">sales@dynamicprecisionindustries.com</a> / <a href="mailto:gopal@dynamicprecisionindustries.com" target="_blank">gopal@dynamicprecisionindustries.com</a></p>
        </div>`;

    if (typeof to[0] === "string") {
      to = to[0].split(",").map((mail) => mail.trim());
    }

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
        html: `
    <p>Dear ${recipientName},</p>
    ${html}
    <br><br>${signature ? `<p>${signature}</p>` : ""}
  `,
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

const sendMail = async ({
  to,
  recipientPeople,
  subject,
  text,
  html,
  attachments,
  signature,
  mState,
}) => {
  const isTrue = mState === "true";
  const MAIL_USER = isTrue ? process.env.MAIL_USER_1 : process.env.MAIL_USER_2;
  const MAIL_PASS = isTrue ? process.env.MAIL_PASS_1 : process.env.MAIL_PASS_2;
  const MAIL_FROM = isTrue ? process.env.MAIL_FROM_1 : process.env.MAIL_FROM_2;

  signature = isTrue
    ? `<div>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Gopal Vashiyar</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'><i>Sales Executive</i></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Mobile: +91-9979851555</p><br><br>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#833c0b;margin:0px;padding:0px'><b>Dynamic Technocast</b></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Survey No. 194, Plot No.50, Ishwar Industrial Area,</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Kothariya Solavant, Rajkot – 3600229 (Gujarat State) INDIA</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Web:</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Foundry Unit: <a href="https://www.dynamictechnocast.com/" target="_blank">https://dynamictechnocast.com/</a></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Machining Unit: <a href="https://www.dynamicprecisionindustries.com/" target="_blank">https://www.dynamicprecisionindustries.com/</a></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Email: <a href="mailto:dynamictechnocast@gmail.com" target="_blank">dynamictechnocast@gmail.com</a> / <a href="mailto:sales@dynamictechnocast.com" target="_blank">sales@dynamictechnocast.com</a></p>
      </div>`
    : `<div>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Gopal Vashiyar</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'><i>Sales Executive</i></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Mobile: +91-9979851555</p><br><br>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#833c0b;margin:0px;padding:0px'><b>Dynamic Precision Industries</b></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>3652, N Road, Phase III Industrial Area, Dared GIDC,</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Jamnagar – 361 004. (Gujarat State) INDIA</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Web:</p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Foundry Unit: <a href="https://www.dynamictechnocast.com/" target="_blank">https://dynamictechnocast.com/</a></p>
        <p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;margin:0px;padding:0px'>Machining Unit: <a href="https://www.dynamicprecisionindustries.com/" target="_blank">https://www.dynamicprecisionindustries.com/</a></p><p style='font-size:10pt;font-family:"Gill Sans MT",sans-serif;color:#806000;margin:0px;padding:0px'>Email: <a href="mailto:sales@dynamicprecisionindustries.com" target="_blank">sales@dynamicprecisionindustries.com</a> / <a href="mailto:gopal@dynamicprecisionindustries.com" target="_blank">gopal@dynamicprecisionindustries.com</a></p>
      </div>`;

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
        html: `
    <p>Dear ${recipientName},</p>
    ${html}
    <br><br>${signature ? `<p>${signature}</p>` : ""}
  `,
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

const getUserTransporter = async (userId, providerId) => {
  const provider = await EmailProvider.findOne({ _id: providerId, userId });
  if (!provider) throw new Error("Email provider not found");

  // If Gmail OAuth2:
  if (provider.providerName === "gmail" && provider.oauth?.refreshToken) {
    const oAuth2Client = new google.auth.OAuth2(
      provider.oauth.clientId,
      provider.oauth.clientSecret
    );
    oAuth2Client.setCredentials({ refresh_token: provider.oauth.refreshToken });

    const { token, res } = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: provider.emailAddress,
        clientId: provider.oauth.clientId,
        clientSecret: provider.oauth.clientSecret,
        refreshToken: provider.oauth.refreshToken,
        accessToken: token,
      },
    });
    return transporter;
  }

  // Else fallback to SMTP
  const passwordMatch = provider.encryptedPassword
    ? await bcrypt.compare(process.env.DEFAULT_SMTP_PASS, provider.encryptedPassword)
    : false;

  if (!passwordMatch && provider.encryptedPassword) {
    throw new Error("Invalid SMTP password (decryption not possible in demo)");
  }

  const transporter = nodemailer.createTransport({
    host: provider.smtpHost,
    port: provider.smtpPort || 587,
    secure: provider.smtpPort === 465,
    auth: {
      user: provider.emailAddress,
      pass: process.env.DEFAULT_SMTP_PASS, // decrypted dynamically in production
    },
  });
  return transporter;
};

// Smart sendMail using user provider
const sendUserMail = async (userId, providerId, { to, subject, html, attachments }) => {
  const transporter = await getUserTransporter(userId, providerId);
  const mailOptions = { from: transporter.options.auth.user, to, subject, html, attachments };
  await transporter.sendMail(mailOptions);
  return { success: true, message: "Mail sent successfully!" };
};

module.exports = {
  sendOTP,
  verifyOTP,
  sendScheduledMail,
  sendMail,
  sendUserMail
}