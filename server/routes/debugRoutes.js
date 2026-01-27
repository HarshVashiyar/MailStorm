// ========================================
// DEBUG ROUTES
// ========================================
// These routes are for debugging and monitoring only
// Enable by setting ENABLE_DEBUG_ROUTES=true in .env
// WARNING: These routes perform multiple Redis operations
// Do NOT expose these publicly or call them frequently
// ========================================

const express = require('express');
const router = express.Router();
const {
  handleGetQueueStats,
  handleGetJobStatus,
  handleGetJobHistory,
  handleRetryJob,
} = require('../controllers/debugController');

// Middleware to check if debug routes are enabled
const debugMiddleware = (req, res, next) => {
  if (process.env.ENABLE_DEBUG_ROUTES !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Debug routes are disabled. Set ENABLE_DEBUG_ROUTES=true in .env to enable.',
    });
  }
  next();
};

// Apply middleware to all debug routes
router.use(debugMiddleware);

// Authentication middleware (use your existing auth middleware)
// const { authenticateUser } = require('../middlewares/authMiddleware');
// router.use(authenticateUser);

// ========================================
// DEBUG ENDPOINTS
// ========================================

// Get queue statistics
// Returns counts of waiting, active, completed, failed, delayed jobs
// Redis operations: ~10 reads
router.get('/queue/stats', handleGetQueueStats);

// Get specific job status by ID
// Returns job state, progress, failure reason, timestamps
// Redis operations: ~2-3 reads
router.get('/queue/job/:jobId', handleGetJobStatus);

// Get job history for current user
// Returns list of jobs filtered by status
// Redis operations: ~5-20 reads (depending on limit)
router.get('/queue/history', handleGetJobHistory);

// Retry a failed job
// Queues the failed job for retry
// Redis operations: ~2-3 reads + 1 write
router.post('/queue/retry/:jobId', handleRetryJob);

// ========================================
// ADDITIONAL DEBUG ENDPOINTS (Optional)
// ========================================

// Clean up old completed jobs manually
router.post('/queue/cleanup', async (req, res) => {
  try {
    const { emailQueue, scheduledEmailQueue } = require('../config/queue');
    
    // Clean completed jobs older than 1 hour
    const emailCleaned = await emailQueue.clean(3600 * 1000, 'completed');
    const scheduledCleaned = await scheduledEmailQueue.clean(3600 * 1000, 'completed');
    
    // Clean failed jobs older than 7 days
    const emailFailedCleaned = await emailQueue.clean(7 * 24 * 3600 * 1000, 'failed');
    const scheduledFailedCleaned = await scheduledEmailQueue.clean(7 * 24 * 3600 * 1000, 'failed');
    
    res.json({
      success: true,
      message: 'Queue cleanup completed',
      cleaned: {
        email: {
          completed: emailCleaned.length,
          failed: emailFailedCleaned.length,
        },
        scheduled: {
          completed: scheduledCleaned.length,
          failed: scheduledFailedCleaned.length,
        },
      },
    });
  } catch (error) {
    console.error('Queue cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup queues',
      error: error.message,
    });
  }
});

// Get detailed Redis info (connection status, memory usage, etc.)
router.get('/redis/info', async (req, res) => {
  try {
    const { emailQueue } = require('../config/queue');
    const client = await emailQueue.client;
    
    res.json({
      success: true,
      redis: {
        status: client.status,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });
  } catch (error) {
    console.error('Redis info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Redis info',
      error: error.message,
    });
  }
});

module.exports = router;