const BulkEmailJob = require('../models/bulkEmailJobDB');
const mongoose = require('mongoose');

// ─── GET /mail/bulk/jobs ──────────────────────────────────────────────────────
// Returns all bulk jobs for the requesting user with deliverySummary counts.
// Uses aggregation (like scheduledMailController) — no Mongoose hydration, no
// deliveryLog array transferred over the wire.
const handleGetBulkJobs = async (req, res) => {
    const user = req.user;
    try {
        const jobs = await BulkEmailJob.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    deliverySummary: {
                        total: { $size: { $ifNull: ['$deliveryLog', []] } },
                        sent: { $size: { $filter: { input: { $ifNull: ['$deliveryLog', []] }, cond: { $eq: ['$$this.status', 'sent'] } } } },
                        failed: { $size: { $filter: { input: { $ifNull: ['$deliveryLog', []] }, cond: { $eq: ['$$this.status', 'failed'] } } } },
                        pending: { $size: { $filter: { input: { $ifNull: ['$deliveryLog', []] }, cond: { $eq: ['$$this.status', 'pending'] } } } },
                    },
                },
            },
            { $project: { deliveryLog: 0 } }, // exclude full array — summary is above
        ]);

        return res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.error('handleGetBulkJobs error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /mail/bulk/jobs/:id/log ─────────────────────────────────────────────
// Returns full per-recipient deliveryLog for one bulk job.
const handleGetBulkJobLog = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const doc = await BulkEmailJob.findOne({ _id: id, userId: user.id })
            .select('subject createdAt status from totalRecipients deliveryLog')
            .lean();

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Bulk email job not found' });
        }

        const log = doc.deliveryLog || [];

        // Sort: failed first, then pending, then sent — easiest triage order
        const ORDER = { failed: 0, pending: 1, sent: 2 };
        log.sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3));

        const summary = {
            total: log.length,
            sent: log.filter(e => e.status === 'sent').length,
            failed: log.filter(e => e.status === 'failed').length,
            pending: log.filter(e => e.status === 'pending').length,
        };

        return res.status(200).json({
            success: true,
            data: {
                _id: doc._id,
                subject: doc.subject,
                createdAt: doc.createdAt,
                status: doc.status,
                from: doc.from,
                totalRecipients: doc.totalRecipients,
                summary,
                deliveryLog: log,
            },
        });
    } catch (error) {
        console.error('handleGetBulkJobLog error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { handleGetBulkJobs, handleGetBulkJobLog };
