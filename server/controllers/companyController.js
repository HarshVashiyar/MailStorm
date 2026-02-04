const Company = require("../models/companyDB");
const List = require("../models/listDB");

const handleGetAllCompanies = async (req, res) => {
    const user = req.user;
    try {
        const companies = await Company.find({ createdBy: user.id }).lean();
        const allLists = await List.find({ createdBy: user.id }).lean();

        const companiesWithLists = companies.map(company => ({
            ...company,
            lists: allLists
                .filter(list => list.listItems?.some(item => item.company?.toString() === company._id.toString()))
                .map(list => ({ listName: list.listName, _id: list._id }))
        }));

        return res.status(200).json({ success: true, message: "Companies retrieved successfully", data: companiesWithLists });
    } catch (err) {
        console.error("Get all companies error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

const handleGetCompanyByID = async (req, res) => {
    const { id } = req.query;
    const user = req.user;
    if (!id) {
        return res.status(400).json({ success: false, message: "Company ID is required" });
    }
    try {
        const company = await Company.findOne({
            _id: req.query.id,
            createdBy: req.user.id,
        });
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        const lists = await List.find({
            "listItems.company": company._id,
        }).select("listName");
        res.status(200).json({
            success: true,
            data: {
                company,
                lists,
            },
        });
    } catch (err) {
        console.error("Get company by ID error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

const handleAddCompany = async (req, res) => {
    const { companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone, hasProcurementTeam } = req.body;
    const user = req.user;
    if (!companyName) {
        return res.status(400).json({ success: false, message: "Company name is required" });
    }
    try {
        const newCompany = await Company.create({
            companyName,
            companyWebsite,
            companyCountry,
            companyAddress,
            companyEmail,
            companyPhone,
            companyProductGroup,
            companyContactPersonName,
            companyContactPersonPhone,
            hasProcurementTeam,
            createdBy: user.id
        });
        return res.status(201).json({ success: true, message: "Company added successfully", data: newCompany });
    } catch (err) {
        console.error("Add company error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

const handleUpdateCompany = async (req, res) => {
    const { id, companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone, hasProcurementTeam } = req.body;
    const user = req.user;
    if (!id) {
        return res.status(400).json({ success: false, message: "Company ID is required" });
    }
    try {
        const updatedCompany = await Company.findOne({ _id: id, createdBy: user.id });
        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        if (companyName) updatedCompany.companyName = companyName;
        if (companyWebsite !== undefined) updatedCompany.companyWebsite = companyWebsite;
        if (companyCountry !== undefined) updatedCompany.companyCountry = companyCountry;
        if (companyAddress !== undefined) updatedCompany.companyAddress = companyAddress;
        if (companyEmail !== undefined) updatedCompany.companyEmail = companyEmail;
        if (companyPhone !== undefined) updatedCompany.companyPhone = companyPhone;
        if (companyProductGroup !== undefined) updatedCompany.companyProductGroup = companyProductGroup;
        if (companyContactPersonName !== undefined) updatedCompany.companyContactPersonName = companyContactPersonName;
        if (companyContactPersonPhone !== undefined) updatedCompany.companyContactPersonPhone = companyContactPersonPhone;
        if (hasProcurementTeam !== undefined) updatedCompany.hasProcurementTeam = hasProcurementTeam;
        await updatedCompany.save();
        return res.status(200).json({ success: true, message: "Company updated successfully", data: updatedCompany });
    } catch (err) {
        console.error("Update company error:", err);
        // if (err.name === "ValidationError") {
        //     const messages = Object.values(err.errors).map(val => val.message);
        //     return res.status(400).json({ success: false, message: messages.join(", ") });
        // }
        // if (err.code === 11000) {
        //     return res.status(400).json({ success: false, message: "Company with this email already exists" });
        // }
        // if (err.name === "CastError") {
        //     return res.status(400).json({ success: false, message: "Invalid company ID" });
        // }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleUpdateCompanyNote = async (req, res) => {
    const { id, companyNote } = req.body;
    const user = req.user;
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }
        const updatedCompany = await Company.findOne({ _id: id, createdBy: user.id });
        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        updatedCompany.companyNotes = companyNote;
        await updatedCompany.save();
        return res.status(200).json({ success: true, message: "Company note updated successfully", data: updatedCompany });
    } catch (err) {
        console.error("Update company note error:", err);
        if (err.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid company ID" });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
}

const handleRemoveCompanies = async (req, res) => {
    const { companyIds } = req.body;
    try {
        if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
            return res.status(400).json({ success: false, message: "No companies selected" });
        }
        const result = await Company.deleteMany({ _id: { $in: companyIds } });
        return res.status(200).json({ success: true, message: `${result.deletedCount} company(ies) deleted successfully`, data: result });
    } catch (err) {
        console.error("Remove companies error:", err);
        if (err.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid company ID format" });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
}

const handleImportCompanies = async (req, res) => {
    const companiesData = req.body;
    const user = req.user;
    if (!companiesData || companiesData.length === 0) {
        return res.status(400).json({ success: false, message: "No companies data found" });
    }
    if (!Array.isArray(companiesData)) {
        return res.status(400).json({ success: false, message: "Invalid data format" });
    }
    if (!companiesData.every(company => company.companyName)) {
        return res.status(400).json({ success: false, message: "All companies must have a company name" });
    }
    try {
        const companiesWithCreator = companiesData.map(company => ({
            ...company,
            createdBy: user.id
        }));
        const insertedCompanies = await Company.insertMany(companiesWithCreator, { ordered: false });
        return res.status(201).json({ success: true, message: `${insertedCompanies.length} company(ies) imported successfully`, data: insertedCompanies });
    } catch (err) {
        console.error("Import companies error:", err);
        console.error("Error name:", err.name);
        console.error("Error code:", err.code);
        if (err.name === "ValidationError") {
            const errorMessages = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
        }
        if (err.code === 11000) {
            const inserted = err.insertedDocs ? err.insertedDocs.length : 0;
            return res.status(207).json({ success: true, message: `${inserted} company(ies) imported, some duplicates were skipped` });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    handleGetAllCompanies,
    handleGetCompanyByID,
    handleAddCompany,
    handleUpdateCompany,
    handleRemoveCompanies,
    handleUpdateCompanyNote,
    handleImportCompanies
};