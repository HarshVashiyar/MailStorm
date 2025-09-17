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
const { checkForAuthorizationHeader, checkAdmin } = require("../utilities/userUtil");

app.get('/', (req, res) => {
    res.send('Company router');
});

app.get('/getall', handleGetAllCompanies);

app.get('/:id', handleGetCompanyByID);

app.post('/add', handleAddCompany);

app.put('/update', handleUpdateCompany);

app.put('/note', handleUpdateCompanyNote);

app.delete('/remove', handleRemoveCompanies);

app.post('/import', handleImportCompanies);

module.exports = app;