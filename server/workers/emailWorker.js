require('dotenv').config();
const nodemailer = require('nodemailer');
const { emailQueue, scheduledEmailQueue } = require('../config/queue');

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER_1,
      pass: process.env.MAIL_PASS_1,
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Limit concurrent connections
    maxMessages: 100, // Limit messages per connection
  });
};

const transporter = createTransporter();

// Process single email job
const processSingleEmail = async (job) => {
  const { to, subject, html, recipientName, attachments, from } = job.data;
  
  try {
    const MAIL_FROM = from || process.env.MAIL_FROM_1;
    const MAIL_USER = process.env.MAIL_USER_1;
    
    const mailOptions = {
      from: `${MAIL_FROM} <${MAIL_USER}>`,
      to,
      subject,
      html: `<p>Dear ${recipientName || 'Sir/Madam'},</p>${html}`,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Update job progress
    await job.progress(100);
    
    return {
      success: true,
      messageId: info.messageId,
      to,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    
    // If this is the last attempt, log the error
    if (job.attemptsMade >= job.opts.attempts) {
      console.error(`Max retries reached for email to ${to}`);
    }
    
    throw error; // Re-throw to mark job as failed
  }
};

// Process bulk email job (adds individual emails to queue)
const processBulkEmail = async (job) => {
  const { emails, subject, html, attachments, from, userId } = job.data;
  
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
          from,
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
  const { to, recipientPeople, subject, html, attachments, scheduledMailId } = job.data;
  
  try {
    const totalEmails = to.length;
    const results = [];
    
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
          attachments,
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