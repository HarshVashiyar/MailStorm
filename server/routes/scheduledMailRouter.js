const express = require("express");
const app = express.Router();
const {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
} = require("../controllers/scheduledMailController");
const { scheduledUpload, processFiles } = require("../middlewares/storeFiles");
const { authenticateUser } = require("../utilities/userUtil");

app.get("/", (req, res) => {
  res.send("Welcome to Scheduled Mail(s) Router!");
});

app.get("/getall", authenticateUser,handleGetScheduledMails);

// Error handling middleware
const multerErrorHandler = (err, req, res, next) => {
  console.log('=== Multer Error ===');
  console.log('Error:', err);
  console.log('Error message:', err.message);
  console.log('Error field:', err.field);
  console.log('Error code:', err.code);
  res.status(400).json({ message: err.message, field: err.field });
};

app.post(
  "/add",
  authenticateUser,
  debugFormData,
  scheduledUpload.array("files", 10), // Increased limit to 10
  multerErrorHandler,
  processFiles,
  handleAddScheduledMail
);

app.delete("/remove", authenticateUser, handleDeleteScheduledMails);

module.exports = app;
