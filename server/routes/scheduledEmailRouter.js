const express = require("express");
const app = express.Router();
const {
  handleAddScheduledEmail,
  handleGetScheduledEmails,
  handleDeleteScheduledEmails,
} = require("../controllers/scheduledEmailController");
const { scheduledUpload, processFiles } = require("../middlewares/storeFiles");

app.get("/", (req, res) => {
  res.send("ScheduledEmail router.");
});

app.get("/getall", handleGetScheduledEmails);

app.post(
  "/add",
  scheduledUpload.array("files", 5),
  processFiles,
  handleAddScheduledEmail
);

app.delete("/remove", handleDeleteScheduledEmails);

module.exports = app;
