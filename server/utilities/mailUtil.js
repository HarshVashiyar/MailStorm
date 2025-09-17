require("dotenv").config();
const { sign } = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");

const sendScheduledEmail = async ({
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
      to = to[0].split(",").map((email) => email.trim());
    }

    if (to.length !== recipientPeople.length) {
      recipientPeople = [];
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    const promises = to.map((email, index) => {
      const recipientName = recipientPeople[index] || "User";
      return transporter.sendMail({
        from: `${MAIL_FROM} <${MAIL_USER}>`,
        to: email,
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
    return { success: true, message: "Email(s) sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send emails. Please try again later.",
    };
  }
};

const sendEmail = async ({
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

    const promises = to.map((email, index) => {
      const recipientName = recipientPeople[index] || "User";
      return transporter.sendMail({
        from: `${MAIL_FROM} <${MAIL_USER}>`,
        to: email,
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
    return { success: true, message: "Email(s) sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send emails. Please try again later.",
    };
  }
};

const otpStorage = {};

const generateOTP = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const sendOTP = async (email) => {
  const otp = generateOTP();
  const otpExpiration = Date.now() + 2 * 60 * 1000;
  otpStorage[email] = { otp, otpExpiration };

  const emailContent = {
    to: [email],
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    html: `<b>Your OTP is ${otp}</b>. It is valid for 2 minutes.`,
  };

  const response = await sendEmail(emailContent);
  if (response.success) {
    response.otp = otp;
  }
  return response;
};

const verifyOTP = (email, otp) => {
  const otpData = otpStorage[email];
  if (!otpData) {
    return { success: false, message: "OTP not found!" };
  }
  if (Date.now() > otpData.otpExpiration) {
    delete otpStorage[email];
    return { success: false, message: "OTP expired!" };
  }
  if (otpData.otp !== otp) {
    return { success: false, message: "Invalid OTP!" };
  }
  delete otpStorage[email];
  return { success: true, message: "OTP verified successfully" };
};

module.exports = {
  sendEmail,
  sendOTP,
  verifyOTP,
  sendScheduledEmail,
};
