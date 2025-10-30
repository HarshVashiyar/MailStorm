const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        templateName: {
            type: String,
            required: [true, "Template name is required"],
            trim: true,
            minLength: [3, "Template name must be at least 3 characters long"],
            unique: true
        },
        templateSubject: {
            type: String,
            required: [true, "Template subject is required"],
            trim: true,
            minLength: [3, "Template subject must be at least 3 characters long"],
        },
        templateContent: {
            type: String,
            required: [true, "Template content is required"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
)

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;