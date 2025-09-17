const mongoose = require("mongoose");

const scheduledEmailSchema = new mongoose.Schema(
    {
        from: {
            type: String,
            required: true,
        },
        to: {
            type: [String],
            required: true,
            //   validate: {
            //     validator: function (emails) {
            //       return emails.every((email) =>
            //         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            //       );
            //     },
            //     message: "Invalid email format in 'to' field.",
            //   },
        },
        subject: {
            type: String,
            required: true,
            maxlength: 255,
        },
        recipientPeople: {
            type: [String],
            default: [],
        },
        text: {
            type: String,
            default: "",
        },
        html: {
            type: String,
            default: "",
        },
        attachments: [
            {
                filename: { type: String, required: true },
                path: { type: String, required: true },
                contentType: { type: String, default: "application/octet-stream" },
            },
        ],
        signature: {
            type: String,
            default: "",
        },
        sendAt: {
            type: Date,
            required: true,
        },
        status: { 
            type: String, 
            default: 'pending' 
        },
        mState: {
            type: Boolean,
            required: true,
            default: true,
        }
    },
    { timestamps: true }
);

const ScheduledEmail = mongoose.model("ScheduledEmail", scheduledEmailSchema);
module.exports = ScheduledEmail;