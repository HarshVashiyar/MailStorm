const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        templateName: {
            type: String,
            required: [true, "Template name is required!"],
            trim: true,
            minLength: [3, "Template name must be at least 3 characters long!"],
            maxLength: [100, "Template name cannot exceed 100 characters!"],
        },
        templateSubject: {
            type: String,
            required: [true, "Template subject is required!"],
            trim: true,
            minLength: [3, "Template subject must be at least 3 characters long!"],
            maxLength: [500, "Template subject cannot exceed 500 characters!"],
        },
        templateContent: {
            type: String,
            required: [true, "Template content is required!"],
            trim: true,
            minLength: [3, "Template content must be at least 3 characters long!"],
            // maxLength: [50000, "Template content cannot exceed 50000 characters!"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
)

templateSchema.index({ createdBy: 1, templateName: 1 }, { unique: true });

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;