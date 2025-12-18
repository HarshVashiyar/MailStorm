require('dotenv').config();
const Queue = require('bull');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create email queue
const emailQueue = new Queue('emailQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 seconds delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
  limiter: {
    max: 100, // Max 100 jobs
    duration: 60000, // Per 60 seconds (adjust based on your email provider limits)
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 2, // Max number of times a job can be stalled before being failed
  },
});

// Create scheduled email queue
const scheduledEmailQueue = new Queue('scheduledEmailQueue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 500,
    },
  },
});

// Queue event listeners for monitoring
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

emailQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

scheduledEmailQueue.on('completed', (job, result) => {
  console.log(`✅ Scheduled job ${job.id} completed:`, result);
});

scheduledEmailQueue.on('failed', (job, err) => {
  console.error(`❌ Scheduled job ${job.id} failed:`, err.message);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queues...');
  await emailQueue.close();
  await scheduledEmailQueue.close();
  process.exit(0);
});

module.exports = {
  emailQueue,
  scheduledEmailQueue,
  redisConfig,
};