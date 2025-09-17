const Company = require("../models/companyDB");

const handleGetAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        return res.status(200).send(companies);
    } catch (err) {
        console.error("Get all companies error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleGetCompanyByID = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await Company.findById(id);
        if (!company) return res.status(404).send("Company not found");
        return res.status(200).send(company);
    } catch (err) {
        console.error("Get company by ID error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleAddCompany = async (req, res) => {
    const { companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone } = req.body;
    if(!companyName) return res.status(400).send("Company name is required");
    try {
        const existingCompany = await Company.findOne({ companyEmail });
        if (existingCompany) return res.status(400).send("Company already exists!");
        const newCompany = await Company.create({ companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone });
        return res.status(201).send(newCompany);
    } catch (err) {
        console.error("Add company error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleUpdateCompany = async (req, res) => {
    const { id, companyName, companyWebsite, companyCountry, companyAddress, companyEmail, companyPhone, companyProductGroup, companyContactPersonName, companyContactPersonPhone } = req.body;
    try {
        const updatedCompany = await Company.findById(id);
        if (!updatedCompany) return res.status(404).send("Company not found");
        updatedCompany.companyName = companyName;
        updatedCompany.companyWebsite = companyWebsite;
        updatedCompany.companyCountry = companyCountry;
        updatedCompany.companyAddress = companyAddress;
        updatedCompany.companyEmail = companyEmail;
        updatedCompany.companyPhone = companyPhone;
        updatedCompany.companyProductGroup = companyProductGroup;
        updatedCompany.companyContactPersonName = companyContactPersonName;
        updatedCompany.companyContactPersonPhone = companyContactPersonPhone;
        await updatedCompany.save();
        return res.status(200).send(updatedCompany);
    } catch (err) {
        console.error("Update company error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleUpdateCompanyNote = async (req, res) => {
    const { id, companyNote } = req.body;
    try {
        const updatedCompany = await Company.findById(id);
        if (!updatedCompany) return res.status(404).send("Company not found");
        updatedCompany.companyNotes = companyNote;
        await updatedCompany.save();
        return res.status(200).send(updatedCompany);
    } catch (err) {
        console.error("Update company note error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleRemoveCompanies = async (req, res) => {
    try {
        const { companyIds } = req.body;
        if (!companyIds || companyIds.length === 0) {
            return res.status(400).json({ message: "No companies selected" });
        }
        const deletedCompanies = await Company.deleteMany({ _id: { $in: companyIds } });
        return res.status(200).send(deletedCompanies);
    } catch (err) {
        console.error("Remove companies error:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
    }
}

const handleImportCompanies = async (req, res) => {
    const companiesData = req.body;
    if (!companiesData || companiesData.length === 0) {
      return res.status(400).json({ message: "No companies data found" });
    }
    if(!Array.isArray(companiesData)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    if(!companiesData.every(company => company.companyName)) {
      return res.status(400).json({ message: "Company name is required" });
    }
    try {
      const insertedCompanies = await Company.insertMany(companiesData);
      return res
        .status(201)
        .json({ message: "Companies imported successfully", data: insertedCompanies });
    } catch (err) {
      console.error("Import companies error:", err);
      return res.status(500).json({ message: "Internal server error", error: err.message });
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