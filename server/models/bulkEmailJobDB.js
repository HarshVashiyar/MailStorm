const mongoose = require('mongoose');

const bulkEmailJobSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        from: {
            type: String,
            trim: true,
        },
        smtpAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SmtpAccount',
        },
        totalRecipients: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ['queued', 'processing', 'sent', 'partially_sent', 'failed'],
            default: 'queued',
            index: true,
        },
        // Per-recipient delivery outcomes — seeded by worker when job fires
        deliveryLog: [
            {
                email: { type: String, required: true, trim: true },
                name: { type: String, default: 'User' },
                status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
                sentAt: { type: Date, default: null },
                error: { type: String, default: null },
            }
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

bulkEmailJobSchema.index({ 'deliveryLog.status': 1 });

// Virtual: delivery summary counts — computed on read, no extra DB writes
bulkEmailJobSchema.virtual('deliverySummary').get(function () {
    const log = this.deliveryLog || [];
    return {
        total: log.length,
        sent: log.filter(e => e.status === 'sent').length,
        failed: log.filter(e => e.status === 'failed').length,
        pending: log.filter(e => e.status === 'pending').length,
    };
});

const BulkEmailJob = mongoose.model('BulkEmailJob', bulkEmailJobSchema);
module.exports = BulkEmailJob;
