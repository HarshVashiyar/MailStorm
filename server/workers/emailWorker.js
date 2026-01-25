require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { emailQueue, scheduledEmailQueue } = require('../config/queue');
const Company = require('../models/companyDB');
const SmtpAccount = require('../models/SmtpAccount');
const smtpUtil = require('../utilities/smtpUtil');
const axios = require('axios');

// Create transporter dynamically based on SMTP account
const createTransporter = async (smtpAccount) => {
  if (smtpAccount.authType === 'oauth') {
    // Decrypt OAuth tokens
    const accessToken = smtpAccount.decryptData(smtpAccount.oauthTokens.accessToken);
    const refreshToken = smtpAccount.decryptData(smtpAccount.oauthTokens.refreshToken);

    if (smtpAccount.provider === 'gmail') {
      // For Gmail OAuth, use Gmail API instead of SMTP
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

      // Check and refresh token if needed
      if (new Date() >= smtpAccount.oauthTokens.tokenExpiry) {
        const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
        smtpAccount.oauthTokens.accessToken = newCreds.access_token;
        smtpAccount.oauthTokens.tokenExpiry = new Date(newCreds.expiry_date);
        await smtpAccount.save();
        oauth2Client.setCredentials(newCreds);
      }

      // Return a custom transporter that uses Gmail API with attachment support
      return {
        sendMail: async (mailOptions) => {
          const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

          // Build MIME message with attachment support
          const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          let messageParts = [
            `From: ${mailOptions.from}`,
            `To: ${mailOptions.to}`,
            `Subject: ${mailOptions.subject}`,
            'MIME-Version: 1.0',
          ];

          // Check if there are attachments
          if (mailOptions.attachments && mailOptions.attachments.length > 0) {
            // Multipart message with attachments
            messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
            messageParts.push('');

            // HTML body part
            messageParts.push(`--${boundary}`);
            messageParts.push('Content-Type: text/html; charset=utf-8');
            messageParts.push('Content-Transfer-Encoding: 7bit');
            messageParts.push('');
            messageParts.push(mailOptions.html);
            messageParts.push('');

            // Add each attachment
            for (const attachment of mailOptions.attachments) {
              messageParts.push(`--${boundary}`);
              messageParts.push(`Content-Type: ${attachment.contentType || 'application/octet-stream'}`);
              messageParts.push('Content-Transfer-Encoding: base64');
              messageParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
              messageParts.push('');

              // The content is already base64 from mailController.js
              messageParts.push(attachment.content);
              messageParts.push('');
            }

            // Close boundary
            messageParts.push(`--${boundary}--`);
          } else {
            // Simple HTML message without attachments
            messageParts.push('Content-Type: text/html; charset=utf-8');
            messageParts.push('Content-Transfer-Encoding: 7bit');
            messageParts.push('');
            messageParts.push(mailOptions.html);
          }

          const message = messageParts.join('\n');

          // Encode the message in base64url format
          const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedMessage,
            },
          });

          return {
            messageId: result.data.id,
            response: '250 OK - Gmail API',
          };
        }
      };
    } else if (smtpAccount.provider === 'outlook') {
      // OAuth handling for Outlook
      return nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          type: 'OAuth2',
          user: smtpAccount.email,
          clientId: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
      });
    } else if (smtpAccount.provider === 'yahoo') {
      // OAuth handling for Yahoo
      return nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: smtpAccount.email,
          clientId: process.env.YAHOO_CLIENT_ID,
          clientSecret: process.env.YAHOO_CLIENT_SECRET,
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
      });
    } else {
      throw new Error(`Unsupported OAuth provider: ${smtpAccount.provider}`);
    }
  } else {
    // Handle password-based SMTP (custom)
    const password = smtpAccount.decryptData(smtpAccount.smtpConfig.encryptedPassword);

    return nodemailer.createTransport({
      host: smtpAccount.smtpConfig.host,
      port: smtpAccount.smtpConfig.port,
      secure: smtpAccount.smtpConfig.secure,
      auth: {
        user: smtpAccount.email,
        pass: password,
      },
    });
  }
};

// Process single email job
const processSingleEmail = async (job) => {
  const { to, subject, html, recipientName, attachments, smtpAccountId } = job.data;

  try {
    // Get SMTP account from database
    const smtpAccount = await SmtpAccount.findById(smtpAccountId);

    if (!smtpAccount) {
      throw new Error('SMTP account not found');
    }

    if (!smtpUtil.canSendEmail(smtpAccount)) {
      throw new Error(`SMTP account cannot send emails. Status: ${smtpAccount.status}`);
    }

    // Create transporter dynamically
    const transporter = await createTransporter(smtpAccount);

    const mailOptions = {
      from: `${smtpAccount.email}`,
      to,
      subject,
      html: `<p>Dear ${recipientName || 'Sir/Madam'},</p>${html}`,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    // Increment email count for this SMTP account
    await smtpUtil.incrementEmailCount(smtpAccount, 1);

    await job.progress(100);

    const companies = await Company.find({ companyEmail: { $in: to } });
    companies.forEach(async (company) => {
      company.history.push({ lastSent: new Date(), subject });
      await company.save();
    });

    return {
      success: true,
      messageId: info.messageId,
      to,
      sentFrom: smtpAccount.email,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);

    // Log error to SMTP account
    if (smtpAccountId) {
      try {
        const smtpAccount = await SmtpAccount.findById(smtpAccountId);
        if (smtpAccount) {
          smtpAccount.errorLog.lastError = error.message;
          smtpAccount.errorLog.lastErrorAt = new Date();
          smtpAccount.status = 'error';
          await smtpAccount.save();
        }
      } catch (logError) {
        console.error('Failed to log error to SMTP account:', logError);
      }
    }

    throw error; // Re-throw to mark job as failed
  }
};

// Process bulk email job (adds individual emails to queue)
const processBulkEmail = async (job) => {
  const { emails, subject, html, attachments, smtpAccountId, userId } = job.data;

  try {
    const jobIds = [];
    const totalEmails = emails.length;

    // Add individual email jobs to the queue
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      const emailJob = await emailQueue.add(
        'single-email',
        {
          to: email.to,
          recipientName: email.recipientName,
          subject,
          html,
          attachments,
          smtpAccountId, // Pass SMTP account ID to single email jobs
          userId,
          bulkJobId: job.id,
        },
        {
          priority: 5, // Lower priority than direct single emails
          attempts: 3,
        }
      );

      jobIds.push(emailJob.id);

      // Update progress
      const progress = Math.round(((i + 1) / totalEmails) * 100);
      await job.progress(progress);
    }

    return {
      success: true,
      message: `${totalEmails} emails queued successfully`,
      jobIds,
      totalEmails,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to process bulk email:', error.message);
    throw error;
  }
};

// Process scheduled email job
const processScheduledEmail = async (job) => {
  const { to, recipientPeople, subject, html, attachments, scheduledMailId, smtpAccountId } = job.data;

  try {
    const totalEmails = to.length;
    const results = [];

    // Convert Cloudinary URLs to base64
    const processedAttachments = await Promise.all(
      (attachments || []).map(async (att) => {
        if (att.path && att.path.startsWith('http')) {
          // Fetch from Cloudinary and convert to base64
          const response = await axios.get(att.path, { responseType: 'arraybuffer' });
          return {
            filename: att.filename,
            content: Buffer.from(response.data).toString('base64'),
            encoding: 'base64',
            contentType: att.contentType,
          };
        }
        return att;
      })
    );

    // Send emails with rate limiting (handled by queue limiter)
    for (let i = 0; i < to.length; i++) {
      const recipientName = recipientPeople[i] || 'User';

      const emailJob = await emailQueue.add(
        'single-email',
        {
          to: to[i],
          recipientName,
          subject,
          html,
          attachments: processedAttachments,
          smtpAccountId, // Pass SMTP account ID
        },
        {
          priority: 3, // Medium priority
        }
      );

      results.push({ email: to[i], jobId: emailJob.id });

      // Update progress
      const progress = Math.round(((i + 1) / totalEmails) * 100);
      await job.progress(progress);
    }

    // Update scheduled mail status in database
    if (scheduledMailId) {
      const ScheduledMail = require('../models/scheduledMailDB');
      await ScheduledMail.findByIdAndUpdate(scheduledMailId, { status: 'Sent' });
    }

    return {
      success: true,
      message: `${totalEmails} scheduled emails queued successfully`,
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to process scheduled email:', error.message);
    throw error;
  }
};

// Email queue processor
emailQueue.process('single-email', 5, processSingleEmail); // Process 5 concurrent emails
emailQueue.process('bulk-email', 2, processBulkEmail); // Process 2 bulk jobs concurrently

// Scheduled email queue processor
scheduledEmailQueue.process('scheduled-email', processScheduledEmail);

// Error handlers
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});

scheduledEmailQueue.on('error', (error) => {
  console.error('Scheduled email queue error:', error);
});

console.log('✅ Email workers started successfully');

module.exports = {
  emailQueue,
  scheduledEmailQueue,
};