const express = require("express");
const app = express.Router();
const {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
  // handleUpdateScheduledMail
} = require("../controllers/scheduledMailController");
const { scheduledUpload, processFiles } = require("../middlewares/storeFiles");
const { authenticateUser } = require("../utilities/userUtil");

app.get("/", (req, res) => {
  res.send("Welcome to Scheduled Mail(s) Router!");
});

app.get("/getall", authenticateUser, handleGetScheduledMails);

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
  scheduledUpload.array("files", 5),
  // processFiles,
  handleAddScheduledMail,
  multerErrorHandler
);

// app.put("/update", authenticateUser, handleUpdateScheduledMail);

app.delete("/remove", authenticateUser, handleDeleteScheduledMails);

module.exports = app;
