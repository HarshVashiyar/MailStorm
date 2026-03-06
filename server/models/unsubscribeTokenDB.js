const mongoose = require('mongoose');

const unsubscribeTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    smtpAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SmtpAccount',
        required: true,
    },
    recipientEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index so lookups by sender + recipient + slot are fast
unsubscribeTokenSchema.index({ senderId: 1, recipientEmail: 1, smtpAccountId: 1 });

const UnsubscribeToken = mongoose.model('UnsubscribeToken', unsubscribeTokenSchema);
module.exports = UnsubscribeToken;
