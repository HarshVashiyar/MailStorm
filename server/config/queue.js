require('dotenv').config();
const Queue = require('bull');

// Centralized Redis client for Bull queues
const redisClient = require('./redisClient');
const redisConfig = redisClient.options;

// Create email queue with optimized settings
const emailQueue = new Queue('emailQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds delay
    },
    removeOnComplete: true, // ✅ OPTIMIZED: Auto-remove completed jobs immediately
    removeOnFail: 50, // ✅ OPTIMIZED: Keep only last 50 failed jobs for debugging
  },
  limiter: {
    max: 1500,    // 25 workers × ~60 jobs/min each = ~1500/min theoretical max
    duration: 60000,
  },
  settings: {
    stalledInterval: 60000,
    maxStalledCount: 2,
    lockDuration: 60000, // Increased: slow SMTP servers can take >30s; prevents false stalls
  },
});

// Create scheduled email queue with optimized settings
const scheduledEmailQueue = new Queue('scheduledEmailQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true, // ✅ OPTIMIZED: Auto-remove completed jobs immediately
    removeOnFail: 50, // ✅ OPTIMIZED: Keep only last 50 failed jobs
  },
  settings: {
    stalledInterval: 60000, // ✅ OPTIMIZED: Check for stalled jobs every 60 seconds
    maxStalledCount: 2,
  },
});

// High-priority queue for transactional emails (OTP, suspension, unsuspension).
// Kept separate from the bulk queue so a large send never delays an OTP.
const transactionalQueue = new Queue('transactionalQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start at 2s — faster than bulk email retries
    },
    removeOnComplete: true,
    removeOnFail: 25,
  },
  // No limiter — transactional mail must never be rate-throttled
});

// ========================================
// MINIMAL EVENT LISTENERS (Production)
// ========================================
// Only log critical errors, not every job completion
// This reduces Redis polling and console noise

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

// ========================================
// REMOVED: Verbose event listeners
// ========================================
// These cause unnecessary Redis reads and console spam:
// - emailQueue.on('completed', ...)
// - emailQueue.on('stalled', ...)
// - scheduledEmailQueue.on('completed', ...)
// Enable these only when debugging

// ========================================
// DEBUG MODE (Optional)
// ========================================
// Uncomment these when you need detailed monitoring
// Set ENABLE_QUEUE_LOGGING=true in .env to enable

if (process.env.ENABLE_QUEUE_LOGGING === 'true') {
  console.log('⚠️ Queue logging enabled (debug mode)');

  emailQueue.on('completed', (job, result) => {
    console.log(`✅ Email job ${job.id} completed:`, result.message || result.to);
  });

  emailQueue.on('stalled', (job) => {
    console.warn(`⚠️ Email job ${job.id} stalled`);
  });

  scheduledEmailQueue.on('completed', (job, result) => {
    console.log(`✅ Scheduled job ${job.id} completed:`, result.message);
  });

  scheduledEmailQueue.on('stalled', (job) => {
    console.warn(`⚠️ Scheduled job ${job.id} stalled`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queues...');
  await emailQueue.close();
  await scheduledEmailQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing queues...');
  await emailQueue.close();
  await scheduledEmailQueue.close();
  process.exit(0);
});

module.exports = {
  emailQueue,
  scheduledEmailQueue,
  transactionalQueue,
  redisConfig,
};