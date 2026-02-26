require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const axios = require("axios");
const SmtpAccount = require("../models/SmtpAccount");
const smtpUtil = require("./smtpUtil");
const { processHtmlForEmail } = require("./emailImageUtil");
const Company = require("../models/companyDB");

// ─────────────────────────────────────────────────────────────────────────────
// Branding footer appended to every outgoing user email
// ─────────────────────────────────────────────────────────────────────────────
const brandingFooter = `<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center;">
    <p style="font-size: 10px; color: #9ca3af; margin: 0;">Sent via <a href="https://mailstorm.keshavturnomatics.com" style="color: #6b7280; text-decoration: underline;">MailStorm</a>, <a href="https://mailstorm.keshavturnomatics.com/unsubscribe" style="color: #6b7280; text-decoration: underline;">click here to unsubscribe</a></p>
</div>`;

// ─────────────────────────────────────────────────────────────────────────────
// OTP helpers
// ─────────────────────────────────────────────────────────────────────────────
const otpStorage = {};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const sendOTP = async (mail) => {
  const otp = generateOTP();
  const expirationTime = Date.now() + 152 * 1000;
  otpStorage[mail] = { otp, expirationTime };

  const content = {
    from: process.env.ADMIN_MAIL,
    to: mail,
    subject: "Your One-Time Password (OTP) for Email Verification",
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
    secure: true,
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.ADMIN_MAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail(content);
    return { expirationTime };
  } catch (error) {
    console.error(`Error sending OTP to ${mail}:`, error);
    throw new Error("Failed to send OTP");
  }
};

const verifyOTP = (mail, otp) => {
  if (!otp || (typeof otp !== "string" && typeof otp !== "number")) {
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
  if (!otpData) return { success: false, message: "OTP not found!" };
  if (Date.now() > otpData.expirationTime) {
    delete otpStorage[mail];
    return { success: false, message: "OTP expired!" };
  }
  if (otpData.otp != otp) return { success: false, message: "Invalid OTP!" };
  delete otpStorage[mail];
  return { success: true, message: "OTP verified successfully" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin notification emails (suspension / unsuspension)
// ─────────────────────────────────────────────────────────────────────────────
const sendSuspensionEmail = async (email, fullName, reason) => {
  const ADMIN_MAIL = process.env.ADMIN_MAIL;
  const ADMIN_MAIL_PASSWORD = process.env.ADMIN_MAIL_PASSWORD;
  const ADMIN_MAIL_FROM = process.env.ADMIN_MAIL_FROM || "MailStorm";

  const transporter = nodemailer.createTransport({
    host: process.env.ADMIN_SMTP_HOST || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: ADMIN_MAIL, pass: ADMIN_MAIL_PASSWORD },
  });

  const mailOptions = {
    from: `${ADMIN_MAIL_FROM} <${ADMIN_MAIL}>`,
    to: email,
    subject: "Account Suspension Notice - MailStorm",
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
    `,
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
  const ADMIN_MAIL_FROM = process.env.ADMIN_MAIL_FROM || "MailStorm";

  const transporter = nodemailer.createTransport({
    host: process.env.ADMIN_SMTP_HOST || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: ADMIN_MAIL, pass: ADMIN_MAIL_PASSWORD },
  });

  const mailOptions = {
    from: `${ADMIN_MAIL_FROM} <${ADMIN_MAIL}>`,
    to: email,
    subject: "Account Reactivated - MailStorm",
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send unsuspension email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Core email sending utilities (used by emailWorker.js)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Nodemailer-compatible transporter from an SmtpAccount document.
 * Supports Gmail OAuth (via Gmail API), Outlook/Yahoo OAuth2, and custom SMTP.
 */
const createTransporter = async (smtpAccount) => {
  if (smtpAccount.authType === "oauth") {
    const accessToken = smtpAccount.decryptData(smtpAccount.oauthTokens.accessToken);
    const refreshToken = smtpAccount.decryptData(smtpAccount.oauthTokens.refreshToken);

    if (smtpAccount.provider === "gmail") {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: smtpAccount.oauthTokens.tokenExpiry.getTime(),
      });

      // Refresh token if expired
      if (new Date() >= smtpAccount.oauthTokens.tokenExpiry) {
        const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
        smtpAccount.oauthTokens.accessToken = newCreds.access_token;
        smtpAccount.oauthTokens.tokenExpiry = new Date(newCreds.expiry_date);
        await smtpAccount.save();
        oauth2Client.setCredentials(newCreds);
      }

      // Return a custom transporter that uses the Gmail API with full MIME support
      return {
        sendMail: async (mailOptions) => {
          const gmail = google.gmail({ version: "v1", auth: oauth2Client });

          const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const relatedBoundary = `related_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          const inlineAttachments = (mailOptions.attachments || []).filter((att) => att.cid);
          const regularAttachments = (mailOptions.attachments || []).filter((att) => !att.cid);

          let messageParts = [
            `From: ${mailOptions.from}`,
            `To: ${mailOptions.to}`,
            `Subject: ${mailOptions.subject}`,
            "MIME-Version: 1.0",
          ];

          const hasInline = inlineAttachments.length > 0;
          const hasRegular = regularAttachments.length > 0;

          if (hasInline || hasRegular) {
            if (hasRegular) {
              messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
              messageParts.push("");
              messageParts.push(`--${boundary}`);
            }

            if (hasInline) {
              messageParts.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`);
              messageParts.push("");
              messageParts.push(`--${relatedBoundary}`);
              messageParts.push("Content-Type: text/html; charset=utf-8");
              messageParts.push("Content-Transfer-Encoding: 7bit");
              messageParts.push("");
              messageParts.push(mailOptions.html);
              messageParts.push("");

              for (const attachment of inlineAttachments) {
                messageParts.push(`--${relatedBoundary}`);
                messageParts.push(`Content-Type: ${attachment.contentType || "image/png"}`);
                messageParts.push("Content-Transfer-Encoding: base64");
                messageParts.push(`Content-ID: <${attachment.cid}>`);
                messageParts.push(`Content-Disposition: inline; filename="${attachment.filename}"`);
                messageParts.push("");
                const base64Content = Buffer.isBuffer(attachment.content)
                  ? attachment.content.toString("base64")
                  : attachment.content;
                messageParts.push(base64Content);
                messageParts.push("");
              }

              messageParts.push(`--${relatedBoundary}--`);
              if (hasRegular) messageParts.push("");
            } else {
              if (hasRegular) {
                messageParts.push("Content-Type: text/html; charset=utf-8");
                messageParts.push("Content-Transfer-Encoding: 7bit");
                messageParts.push("");
                messageParts.push(mailOptions.html);
                messageParts.push("");
              }
            }

            for (const attachment of regularAttachments) {
              messageParts.push(`--${boundary}`);
              messageParts.push(`Content-Type: ${attachment.contentType || "application/octet-stream"}`);
              messageParts.push("Content-Transfer-Encoding: base64");
              messageParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
              messageParts.push("");
              const base64Content = Buffer.isBuffer(attachment.content)
                ? attachment.content.toString("base64")
                : attachment.content;
              messageParts.push(base64Content);
              messageParts.push("");
            }

            if (hasRegular) messageParts.push(`--${boundary}--`);
          } else {
            // Simple HTML, no attachments
            messageParts.push("Content-Type: text/html; charset=utf-8");
            messageParts.push("Content-Transfer-Encoding: 7bit");
            messageParts.push("");
            messageParts.push(mailOptions.html);
          }

          const encodedMessage = Buffer.from(messageParts.join("\n"))
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
          });

          return { messageId: result.data.id, response: "250 OK - Gmail API" };
        },
      };
    } else if (smtpAccount.provider === "outlook") {
      return nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          type: "OAuth2",
          user: smtpAccount.email,
          clientId: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          refreshToken,
          accessToken,
        },
      });
    } else if (smtpAccount.provider === "yahoo") {
      return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: smtpAccount.email,
          clientId: process.env.YAHOO_CLIENT_ID,
          clientSecret: process.env.YAHOO_CLIENT_SECRET,
          refreshToken,
          accessToken,
        },
      });
    } else {
      throw new Error(`Unsupported OAuth provider: ${smtpAccount.provider}`);
    }
  } else {
    // Password-based custom SMTP
    const password = smtpAccount.decryptData(smtpAccount.smtpConfig.encryptedPassword);
    return nodemailer.createTransport({
      host: smtpAccount.smtpConfig.host,
      port: smtpAccount.smtpConfig.port,
      secure: smtpAccount.smtpConfig.secure,
      auth: { user: smtpAccount.email, pass: password },
    });
  }
};

/**
 * Resolve attachments regardless of where they are stored (Cloudinary URL or Redis base64).
 */
const processAttachments = async (attachments) => {
  if (!attachments || attachments.length === 0) return [];

  return Promise.all(
    attachments.map(async (att) => {
      // Cloudinary-stored attachment
      if (att.storedIn === "cloudinary" && att.path && att.path.startsWith("http")) {
        console.log(`📥 Fetching attachment from Cloudinary: ${att.filename}`);
        try {
          const response = await axios.get(att.path, { responseType: "arraybuffer" });
          return {
            filename: att.filename,
            content: Buffer.from(response.data).toString("base64"),
            encoding: "base64",
            contentType: att.contentType,
          };
        } catch (error) {
          console.error(`Failed to fetch attachment from Cloudinary: ${att.filename}`, error);
          throw new Error(`Failed to fetch attachment: ${att.filename}`);
        }
      }

      // Redis-stored (base64) attachment
      if (att.storedIn === "redis" && att.content) {
        console.log(`💾 Using attachment from Redis: ${att.filename}`);
        return {
          filename: att.filename,
          content: att.content,
          encoding: att.encoding || "base64",
          contentType: att.contentType,
        };
      }

      // Legacy: Cloudinary URL without storedIn flag
      if (att.path && att.path.startsWith("http")) {
        console.log(`📥 Fetching attachment (legacy): ${att.filename}`);
        const response = await axios.get(att.path, { responseType: "arraybuffer" });
        return {
          filename: att.filename,
          content: Buffer.from(response.data).toString("base64"),
          encoding: "base64",
          contentType: att.contentType,
        };
      }

      return att;
    })
  );
};

/**
 * Send a single email using the SMTP account identified by smtpAccountId.
 * Handles attachment resolution, CID image embedding, and branding footer.
 * Throws on failure — callers should catch and handle queue/retry logic.
 */
const sendSingleEmail = async ({ to, subject, html, recipientName, attachments, smtpAccountId }) => {
  const smtpAccount = await SmtpAccount.findById(smtpAccountId);
  if (!smtpAccount) throw new Error("SMTP account not found");

  if (!smtpUtil.canSendEmail(smtpAccount)) {
    throw new Error(`SMTP account cannot send emails. Status: ${smtpAccount.status}`);
  }

  const transporter = await createTransporter(smtpAccount);
  const processedAttachments = await processAttachments(attachments);

  // Build full HTML: greeting + body + branding footer
  const fullHtml = `<p>Dear ${recipientName || "Sir/Madam"},</p>${html}<br>${brandingFooter}`;

  // Convert base64 inline images to CID attachments for email client compatibility
  const { html: processedHtml, inlineAttachments } = await processHtmlForEmail(fullHtml);

  const info = await transporter.sendMail({
    from: smtpAccount.email,
    to,
    subject,
    html: processedHtml,
    attachments: [...processedAttachments, ...inlineAttachments],
  });

  // Update usage counters on the SMTP account
  await smtpUtil.incrementEmailCount(smtpAccount, 1);

  // Log send to company history if recipient is a known company
  const companies = await Company.find({ companyEmail: { $in: to } });
  await Promise.all(
    companies.map((company) => {
      company.history.push({ lastSent: new Date(), subject });
      return company.save();
    })
  );

  return {
    success: true,
    messageId: info.messageId,
    to,
    sentFrom: smtpAccount.email,
    timestamp: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  brandingFooter,
  sendOTP,
  verifyOTP,
  sendSuspensionEmail,
  sendUnsuspensionEmail,
  createTransporter,
  processAttachments,
  sendSingleEmail,
};