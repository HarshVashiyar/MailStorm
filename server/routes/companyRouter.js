const express = require('express');
const app = express.Router();
const {
    handleGetAllCompanies,
    handleGetCompanyByID,
    handleAddCompany,
    handleUpdateCompany,
    handleRemoveCompanies,
    handleUpdateCompanyNote,
    handleImportCompanies
} = require('../controllers/companyController');
const { authenticateUser } = require("../utilities/userUtil");

app.get('/', (req, res) => {
    res.send('Welcome to Company Router!');
});

app.get('/getall', authenticateUser, handleGetAllCompanies);

app.get('/getcompany', authenticateUser, handleGetCompanyByID);

app.post('/add', authenticateUser, handleAddCompany);

app.put('/update', authenticateUser, handleUpdateCompany);

app.put('/note', authenticateUser, handleUpdateCompanyNote);

app.delete('/remove', authenticateUser, handleRemoveCompanies);

app.post('/import', authenticateUser, handleImportCompanies);

module.exports = app;