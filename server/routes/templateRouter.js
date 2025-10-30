const express = require("express");
const app = express.Router();
const {
    handleGetAllTemplates,
    handleGetTemplateByName,
    handleAddTemplate,
    handleUpdateTemplate,
    handleRemoveTemplates
} = require("../controllers/templateController");
const { authenticateUser } = require("../utilities/userUtil");

app.get("/", (req, res) => {
    res.send("Welcome to Template Router!");
});

app.get("/getall", authenticateUser, handleGetAllTemplates);

app.get("/get", authenticateUser, handleGetTemplateByName);

app.post("/add", authenticateUser, handleAddTemplate);

app.put("/update", authenticateUser, handleUpdateTemplate);

app.delete("/remove", authenticateUser, handleRemoveTemplates);

module.exports = app;