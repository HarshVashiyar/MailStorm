const mongoose = require("mongoose");

const scheduledMailSchema = new mongoose.Schema(
    {
        from: {
            type: String,
            required: [true, "Sender email is required!"],
            trim: true,
            validate: {
                validator: function (email) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                },
                message: "Invalid! It must be of the form user@example.com!"
            },
            minlength: [5, 'Email must be at least 5 characters long!'],
            maxlength: [100, 'Email cannot exceed 100 characters!']
        },
        smtpAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SmtpAccount',
            required: false,
        },
        to: {
            type: [String],
            required: [true, "Recipient emails are required!"],
            validate: {
                validator: function (emails) {
                    if (!Array.isArray(emails) || emails.length < 1 || emails.length > 100) {
                        return false;
                    }
                    return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length >= 5 && email.length <= 100);
                },
                message: "Invalid! Must have 1-100 recipient emails, each of the form user@example.com and between 5-100 characters long!"
            }
        },
        subject: {
            type: String,
            required: [true, "Subject is required!"],
            trim: true,
            minlength: [3, 'Subject must be at least 3 characters long!'],
            maxlength: [500, 'Subject cannot exceed 500 characters!']
        },
        recipientPeople: {
            type: [String],
            required: [true, "Recipient names are required!"],
            trim: true,
            validate: {
                validator: function (names) {
                    return names.every(name => name.length >= 3 && name.length <= 100);
                },
                message: "Each recipient name must be between 3 and 100 characters long!"
            },
            minlength: [1, 'At least one recipient name is required!'],
            maxlength: [100, 'Cannot exceed 100 recipient names!']
        },
        html: {
            type: String,
            required: [true, "Content is required!"],
            trim: true,
            validate: {
                validator: function (content) {
                    if (/<script|<iframe|javascript:/i.test(content)) return false;
                    return true;
                },
                message: 'HTML content is invalid, or contains potentially unsafe content!'
            },
            minlength: [3, 'Email content must be at least 3 characters long!'],
        },
        attachments: [
            {
                filename: { type: String, required: true },

                // Cloudinary
                path: {
                    type: String,
                    required: function () {
                        return this.storedIn === 'cloudinary';
                    },
                },

                // Redis (base64)
                content: {
                    type: String,
                    required: function () {
                        return this.storedIn === 'redis';
                    },
                },

                encoding: {
                    type: String,
                    default: 'base64',
                },

                contentType: String,

                size: Number,

                storedIn: {
                    type: String,
                    enum: ['cloudinary', 'redis'],
                    required: true,
                },

                publicId: String, // optional (cloudinary)
            }
        ],
        sendAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Sent', 'Failed'],
            default: 'Pending',
            required: true
        },
        // ✨ NEW: Store Bull queue job ID for tracking
        jobId: {
            type: String,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    { timestamps: true }
);

// Index for efficient querying
scheduledMailSchema.index({ sendAt: 1, status: 1 });
scheduledMailSchema.index({ createdBy: 1, status: 1 });

const ScheduledMail = mongoose.model("ScheduledMail", scheduledMailSchema);
module.exports = ScheduledMail;