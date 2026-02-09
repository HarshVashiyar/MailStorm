require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { emailQueue, scheduledEmailQueue } = require('../config/queue');
const Company = require('../models/companyDB');
const SmtpAccount = require('../models/SmtpAccount');
const smtpUtil = require('../utilities/smtpUtil');
const axios = require('axios');
const { processHtmlForEmail } = require('../utilities/emailImageUtil');

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

          // Build MIME message with attachment and inline image support
          const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const relatedBoundary = `related_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          // Separate inline (CID) attachments from regular attachments
          const inlineAttachments = (mailOptions.attachments || []).filter(att => att.cid);
          const regularAttachments = (mailOptions.attachments || []).filter(att => !att.cid);

          let messageParts = [
            `From: ${mailOptions.from}`,
            `To: ${mailOptions.to}`,
            `Subject: ${mailOptions.subject}`,
            'MIME-Version: 1.0',
          ];

          const hasInline = inlineAttachments.length > 0;
          const hasRegular = regularAttachments.length > 0;

          if (hasInline || hasRegular) {
            // Use multipart/mixed as the outer container if we have regular attachments
            if (hasRegular) {
              messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
              messageParts.push('');
              messageParts.push(`--${boundary}`);
            }

            // If we have inline images, wrap HTML + inline images in multipart/related
            if (hasInline) {
              if (hasRegular) {
                messageParts.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`);
                messageParts.push('');
              } else {
                messageParts.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`);
                messageParts.push('');
              }

              // HTML body part
              messageParts.push(`--${relatedBoundary}`);
              messageParts.push('Content-Type: text/html; charset=utf-8');
              messageParts.push('Content-Transfer-Encoding: 7bit');
              messageParts.push('');
              messageParts.push(mailOptions.html);
              messageParts.push('');

              // Add inline image attachments
              for (const attachment of inlineAttachments) {
                messageParts.push(`--${relatedBoundary}`);
                messageParts.push(`Content-Type: ${attachment.contentType || 'image/png'}`);
                messageParts.push('Content-Transfer-Encoding: base64');
                messageParts.push(`Content-ID: <${attachment.cid}>`);
                messageParts.push(`Content-Disposition: inline; filename="${attachment.filename}"`);
                messageParts.push('');

                // Convert buffer to base64 if needed
                const base64Content = Buffer.isBuffer(attachment.content)
                  ? attachment.content.toString('base64')
                  : attachment.content;
                messageParts.push(base64Content);
                messageParts.push('');
              }

              // Close related boundary
              messageParts.push(`--${relatedBoundary}--`);
              if (hasRegular) {
                messageParts.push('');
              }
            } else {
              // No inline images, just HTML
              if (hasRegular) {
                messageParts.push('Content-Type: text/html; charset=utf-8');
                messageParts.push('Content-Transfer-Encoding: 7bit');
                messageParts.push('');
                messageParts.push(mailOptions.html);
                messageParts.push('');
              }
            }

            // Add regular attachments
            for (const attachment of regularAttachments) {
              messageParts.push(`--${boundary}`);
              messageParts.push(`Content-Type: ${attachment.contentType || 'application/octet-stream'}`);
              messageParts.push('Content-Transfer-Encoding: base64');
              messageParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
              messageParts.push('');

              // Convert buffer to base64 if needed
              const base64Content = Buffer.isBuffer(attachment.content)
                ? attachment.content.toString('base64')
                : attachment.content;
              messageParts.push(base64Content);
              messageParts.push('');
            }

            // Close outer boundary if we have regular attachments
            if (hasRegular) {
              messageParts.push(`--${boundary}--`);
            } else if (!hasInline) {
              // Edge case: no attachments at all
              messageParts.push('Content-Type: text/html; charset=utf-8');
              messageParts.push('Content-Transfer-Encoding: 7bit');
              messageParts.push('');
              messageParts.push(mailOptions.html);
            }
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

// ✅ DYNAMIC STORAGE: Process attachments based on storage type
const processAttachments = async (attachments) => {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  return Promise.all(
    attachments.map(async (att) => {
      // Check if attachment is stored in Cloudinary (has URL)
      if (att.storedIn === 'cloudinary' && att.path && att.path.startsWith('http')) {
        // Fetch from Cloudinary and convert to base64
        console.log(`📥 Fetching attachment from Cloudinary: ${att.filename}`);
        try {
          const response = await axios.get(att.path, { responseType: 'arraybuffer' });
          return {
            filename: att.filename,
            content: Buffer.from(response.data).toString('base64'),
            encoding: 'base64',
            contentType: att.contentType,
          };
        } catch (error) {
          console.error(`Failed to fetch attachment from Cloudinary: ${att.filename}`, error);
          throw new Error(`Failed to fetch attachment: ${att.filename}`);
        }
      }

      // Attachment is already base64 (stored in Redis)
      if (att.storedIn === 'redis' && att.content) {
        console.log(`💾 Using attachment from Redis: ${att.filename}`);
        return {
          filename: att.filename,
          content: att.content, // Already base64
          encoding: att.encoding || 'base64',
          contentType: att.contentType,
        };
      }

      // Legacy support: check if it's a Cloudinary URL without storedIn flag
      if (att.path && att.path.startsWith('http')) {
        console.log(`📥 Fetching attachment (legacy): ${att.filename}`);
        const response = await axios.get(att.path, { responseType: 'arraybuffer' });
        return {
          filename: att.filename,
          content: Buffer.from(response.data).toString('base64'),
          encoding: 'base64',
          contentType: att.contentType,
        };
      }

      // If attachment has content already, return as-is
      return att;
    })
  );
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

    // ✅ DYNAMIC STORAGE: Process attachments based on storage type
    const processedAttachments = await processAttachments(attachments);

    // ✅ CID IMAGE EMBEDDING: Convert inline images to CID attachments
    const fullHtml = `<p>Dear ${recipientName || 'Sir/Madam'},</p>${html}`;
    const { html: processedHtml, inlineAttachments } = await processHtmlForEmail(fullHtml);

    // Combine regular attachments with inline image attachments
    const allAttachments = [...processedAttachments, ...inlineAttachments];

    const mailOptions = {
      from: `${smtpAccount.email}`,
      to,
      subject,
      html: processedHtml,
      attachments: allAttachments,
    };

    const info = await transporter.sendMail(mailOptions);

    // Increment email count for this SMTP account
    await smtpUtil.incrementEmailCount(smtpAccount, 1);

    // REMOVED: await job.progress(100); - Saves 1 Redis write per email

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
    // OPTIMIZED: Use Promise.all for batch job creation (faster)
    const emailJobs = await Promise.all(
      emails.map((email) =>
        emailQueue.add(
          'single-email',
          {
            to: email.to,
            recipientName: email.recipientName,
            subject,
            html,
            attachments, // Pass as-is (already processed by controller)
            smtpAccountId,
            userId,
            bulkJobId: job.id,
          },
          {
            priority: 5,
            attempts: 3,
            removeOnComplete: true, // ✅ Auto-cleanup completed jobs
            removeOnFail: false, // Keep failed jobs for debugging
          }
        )
      )
    );

    // REMOVED: Progress updates in loop - Saves N Redis writes (where N = email count)
    // REMOVED: jobIds array collection - not needed

    return {
      success: true,
      message: `${emails.length} emails queued successfully`,
      totalEmails: emails.length,
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
    // ✅ DYNAMIC STORAGE: Process attachments (handles both Cloudinary and Redis)
    const processedAttachments = await processAttachments(attachments);

    // ✅ Fetch SMTP account to get signature
    let finalHtml = html;
    if (smtpAccountId) {
      const smtpAccount = await SmtpAccount.findById(smtpAccountId);
      if (smtpAccount && smtpAccount.signature) {
        // Append signature to email body
        finalHtml = `${html}<br/><br/>--<br/>${smtpAccount.signature}`;
      }
    }

    // OPTIMIZED: Use Promise.all for batch job creation
    await Promise.all(
      to.map((email, i) => {
        const recipientName = recipientPeople[i] || 'User';

        return emailQueue.add(
          'single-email',
          {
            to: email,
            recipientName,
            subject,
            html: finalHtml, // Use html with signature appended
            attachments: processedAttachments,
            smtpAccountId,
          },
          {
            priority: 3,
            removeOnComplete: true, // ✅ Auto-cleanup completed jobs
            removeOnFail: false,
          }
        );
      })
    );

    // REMOVED: Progress updates in loop - Saves N Redis writes
    // REMOVED: results array collection - not needed

    // Update scheduled mail status in database
    if (scheduledMailId) {
      const ScheduledMail = require('../models/scheduledMailDB');
      await ScheduledMail.findByIdAndUpdate(scheduledMailId, { status: 'Sent' });
    }

    return {
      success: true,
      message: `${to.length} scheduled emails queued successfully`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to process scheduled email:', error.message);
    throw error;
  }
};

// Email queue processor
emailQueue.process('single-email', 5, processSingleEmail);
emailQueue.process('bulk-email', 2, processBulkEmail);

// Scheduled email queue processor
scheduledEmailQueue.process('scheduled-email', processScheduledEmail);

// OPTIMIZED: Simplified error handlers - only log errors, not every completion
emailQueue.on('error', (error) => {
  console.error('❌ Email queue error:', error);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
});

scheduledEmailQueue.on('error', (error) => {
  console.error('❌ Scheduled email queue error:', error);
});

scheduledEmailQueue.on('failed', (job, err) => {
  console.error(`❌ Scheduled email job ${job.id} failed:`, err.message);
});

// REMOVED: Verbose completion logging to reduce console noise
// emailQueue.on('completed', (job, result) => { ... });
// scheduledEmailQueue.on('completed', (job, result) => { ... });

console.log('✅ Email workers started successfully with dynamic attachment storage');

module.exports = {
  emailQueue,
  scheduledEmailQueue,
};