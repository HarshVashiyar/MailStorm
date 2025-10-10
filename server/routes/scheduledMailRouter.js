const express = require("express");
const app = express.Router();
const {
  handleAddScheduledMail,
  handleGetScheduledMails,
  handleDeleteScheduledMails,
} = require("../controllers/scheduledMailController");
const { scheduledUpload, processFiles } = require("../middlewares/storeFiles");

app.get("/", (req, res) => {
  res.send("Welcome to Scheduled Mails Router!");
});

app.get("/getall", handleGetScheduledMails);

app.post(
  "/add",
  scheduledUpload.array("files", 5),
  processFiles,
  handleAddScheduledMail
);

app.delete("/remove", handleDeleteScheduledMails);

module.exports = app;
