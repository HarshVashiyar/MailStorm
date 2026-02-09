const Template = require("../models/templateDB");

const handleGetAllTemplates = async (req, res) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    try {
        const totalItems = await Template.countDocuments({ createdBy: user.id });
        const totalPages = Math.ceil(totalItems / limit);

        const templates = await Template.find({ createdBy: user.id })
            .select('templateName templateSubject templateContent -_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (!templates || !Array.isArray(templates) || templates.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No templates found",
                data: [],
                pagination: {
                    page,
                    limit,
                    totalItems: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        const data = templates.map(t => ({
            templateName: t.templateName,
            templateSubject: t.templateSubject,
            templateContent: t.templateContent
        }));

        return res.status(200).json({
            success: true,
            message: "Templates retrieved successfully",
            data,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error retrieving templates:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleGetTemplateByName = async (req, res) => {
    const user = req.user;
    const { templateName } = req.query;
    try {
        if (!templateName) {
            return res.status(400).json({ success: false, message: "Template name is required" });
        }
        const template = await Template.findOne({ createdBy: user.id, templateName: templateName });
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }
        return res.status(200).json({ success: true, message: "Template retrieved successfully", data: template });
    } catch (error) {
        console.error("Error retrieving template:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleAddTemplate = async (req, res) => {
    const user = req.user;
    const { templateName, templateSubject, templateContent } = req.body;
    try {
        if (!templateName || !templateSubject || !templateContent) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingTemplate = await Template.findOne({ createdBy: user.id, templateName: templateName });
        if (existingTemplate) {
            return res.status(409).json({ success: false, message: "Template with this name already exists" });
        }
        const newTemplate = new Template({
            templateName,
            templateSubject,
            templateContent,
            createdBy: user.id
        });
        await newTemplate.save();
        return res.status(201).json({ success: true, message: "Template added successfully", data: newTemplate });
    } catch (error) {
        console.error("Error adding template:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleUpdateTemplate = async (req, res) => {
    const user = req.user;
    const { templateName, templateSubject, templateContent } = req.body;
    try {
        if (!templateName || !templateSubject || !templateContent) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingTemplate = await Template.findOne({ createdBy: user.id, templateName: templateName });
        if (!existingTemplate) {
            return res.status(404).json({ success: false, message: "Template with this name not found" });
        }
        existingTemplate.templateSubject = templateSubject;
        existingTemplate.templateContent = templateContent;
        await existingTemplate.save();
        return res.status(200).json({ success: true, message: "Template updated successfully", data: existingTemplate });
    } catch (error) {
        console.error("Error updating template:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleRemoveTemplates = async (req, res) => {
    const user = req.user;
    const { templateNames } = req.body;
    try {
        if (!templateNames || !Array.isArray(templateNames) || templateNames.length === 0) {
            return res.status(400).json({ success: false, message: "Template names are required" });
        }
        const removedTemplates = await Template.deleteMany({ createdBy: user.id, templateName: { $in: templateNames } });
        return res.status(200).json({ success: true, message: "Templates removed successfully", data: removedTemplates });
    } catch (error) {
        console.error("Error removing templates:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    handleGetAllTemplates,
    handleGetTemplateByName,
    handleAddTemplate,
    handleUpdateTemplate,
    handleRemoveTemplates
}
