const { emailQueue, scheduledEmailQueue } = require("../config/queue");

// Get queue statistics
const handleGetQueueStats = async (req, res) => {
  try {
    const [
      emailWaiting,
      emailActive,
      emailCompleted,
      emailFailed,
      emailDelayed,
      scheduledWaiting,
      scheduledActive,
      scheduledCompleted,
      scheduledFailed,
      scheduledDelayed,
    ] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
      scheduledEmailQueue.getWaitingCount(),
      scheduledEmailQueue.getActiveCount(),
      scheduledEmailQueue.getCompletedCount(),
      scheduledEmailQueue.getFailedCount(),
      scheduledEmailQueue.getDelayedCount(),
    ]);
    
    res.json({
      success: true,
      queues: {
        email: {
          waiting: emailWaiting,
          active: emailActive,
          completed: emailCompleted,
          failed: emailFailed,
          delayed: emailDelayed,
          total: emailWaiting + emailActive + emailDelayed,
        },
        scheduled: {
          waiting: scheduledWaiting,
          active: scheduledActive,
          completed: scheduledCompleted,
          failed: scheduledFailed,
          delayed: scheduledDelayed,
          total: scheduledWaiting + scheduledActive + scheduledDelayed,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue statistics',
      error: error.message,
    });
  }
};

// Get specific job status
const handleGetJobStatus = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await emailQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const state = await job.getState();
    const progress = job.progress();
    const reason = job.failedReason;

    return res.status(200).json({
      success: true,
      job: {
        id: job.id,
        state,
        progress,
        failedReason: reason,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        data: {
          totalEmails: job.data.emails?.length || 1,
          subject: job.data.subject,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job status",
      error: error.message,
    });
  }
};

// Get user's job history
const handleGetJobHistory = async (req, res) => {
  const user = req.user;
  const { status = 'all', limit = 20 } = req.query;
  
  try {
    let jobs = [];
    
    if (status === 'completed' || status === 'all') {
      const completed = await emailQueue.getCompleted(0, limit);
      jobs = jobs.concat(completed);
    }
    
    if (status === 'failed' || status === 'all') {
      const failed = await emailQueue.getFailed(0, limit);
      jobs = jobs.concat(failed);
    }
    
    if (status === 'active' || status === 'all') {
      const active = await emailQueue.getActive(0, limit);
      jobs = jobs.concat(active);
    }
    
    if (status === 'waiting' || status === 'all') {
      const waiting = await emailQueue.getWaiting(0, limit);
      jobs = jobs.concat(waiting);
    }

    // Filter jobs by userId
    const userJobs = jobs.filter(job => job.data.userId === user.id);

    const jobsData = await Promise.all(
      userJobs.map(async (job) => ({
        id: job.id,
        state: await job.getState(),
        progress: job.progress(),
        data: {
          subject: job.data.subject,
          totalEmails: job.data.emails?.length || 1,
        },
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }))
    );

    return res.status(200).json({
      success: true,
      jobs: jobsData,
      total: jobsData.length,
    });
  } catch (error) {
    console.error("Error fetching job history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job history",
      error: error.message,
    });
  }
};

// Retry failed job
const handleRetryJob = async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const job = await emailQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const state = await job.getState();
    
    if (state !== 'failed') {
      return res.status(400).json({
        success: false,
        message: `Job is ${state}, can only retry failed jobs`
      });
    }

    await job.retry();

    return res.status(200).json({
      success: true,
      message: "Job queued for retry",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error retrying job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retry job",
      error: error.message,
    });
  }
};

module.exports = {
  handleGetQueueStats,
  handleGetJobStatus,
  handleGetJobHistory,
  handleRetryJob,
};