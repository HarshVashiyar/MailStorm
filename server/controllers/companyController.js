const Company = require("../models/companyDB");
const List = require("../models/listDB");

const handleGetAllCompanies = async (req, res) => {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    try {
        // Get total count for pagination metadata
        const totalItems = await Company.countDocuments({ createdBy: user.id });
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch only the companies for current page
        const companies = await Company.find({ createdBy: user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const allLists = await List.find({ createdBy: user.id }).lean();

        // BUILD INDEX: O(m) - one pass through all lists
        const companyToLists = {};
        allLists.forEach(list => {
            list.listItems?.forEach(item => {
                const companyId = item.company?.toString();
                if (companyId) {
                    if (!companyToLists[companyId]) {
                        companyToLists[companyId] = [];
                    }
                    companyToLists[companyId].push({
                        listName: list.listName,
                        _id: list._id
                    });
                }
            });
        });

        // LOOKUP: O(n) - one pass through companies
        const companiesWithLists = companies.map(company => ({
            ...company,
            lists: companyToLists[company._id.toString()] || []
        }));

        return res.status(200).json({
            success: true,
            message: "Companies retrieved successfully",
            data: companiesWithLists,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
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
    const { companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone, companyNotes, hasProcurementTeam } = req.body;
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
            companyNotes,
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
    const { id, companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone, companyNotes, hasProcurementTeam } = req.body;
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
        if (companyNotes !== undefined) updatedCompany.companyNotes = companyNotes;
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

    try {
        const companiesWithCreator = companiesData.map(company => {
            // Validate required fields
            if (!company.companyName || company.companyName.length < 1) {
                throw new Error("Company name is required (min 1 char)");
            }
            if (!company.companyProductGroup || company.companyProductGroup.length < 1) {
                throw new Error("Product group is required (min 1 char)");
            }
            if (!company.companyEmail) {
                throw new Error("Company email is required");
            }
            if (!company.contactPersonName || company.contactPersonName.length < 3) {
                throw new Error("Contact person name is required (min 3 chars)");
            }

            return {
                companyName: company.companyName,
                companyProductGroup: company.companyProductGroup.split(',').map(s => s.trim()),
                companyEmail: company.companyEmail,
                companyContactPersonName: company.contactPersonName,
                companyWebsite: company.website || undefined,
                companyCountry: company.country || undefined,
                companyAddress: company.address || undefined,
                companyPhone: company.companyPhone || undefined,
                companyContactPersonPhone: company.contactPersonPhone || undefined,
                companyNotes: company.notes || undefined,
                hasProcurementTeam: company.procurementTeam === 'true' || company.procurementTeam === true,
                createdBy: user.id
            };
        });

        const insertedCompanies = await Company.insertMany(companiesWithCreator, { ordered: false });

        return res.status(201).json({
            success: true,
            message: `${insertedCompanies.length} company(ies) imported successfully`,
            data: insertedCompanies
        });
    } catch (err) {
        console.error("Import companies error:", err);

        if (err.message.includes("required") || err.message.includes("min")) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.name === "ValidationError") {
            const errorMessages = Object.values(err.errors).map(e => e.message).join(", ");
            return res.status(400).json({ success: false, message: `Validation error: ${errorMessages}` });
        }
        if (err.code === 11000) {
            const inserted = err.insertedDocs ? err.insertedDocs.length : 0;
            return res.status(207).json({
                success: true,
                message: `${inserted} company(ies) imported, some duplicates were skipped`
            });
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