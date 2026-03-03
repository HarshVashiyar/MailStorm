const express = require("express");
const app = express.Router();
const {
  handleSendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
  handleEnhanceSubject,
  handleGenerateHTMLBody
} = require("../controllers/mailController");
const { handleGetBulkJobs, handleGetBulkJobLog } = require("../controllers/bulkJobController");
const { authenticateUser } = require("../utilities/userUtil");
const { upload } = require("../middlewares/storeFiles");

app.get("/", (req, res) => {
  res.send('Welcome to Mail Router');
});

app.post("/sendotp", handleSendOTP);
app.post("/verifyotp", handleVerifyOTP);
app.post("/resetpassword", handleResetPassword);
app.post("/sendmail", authenticateUser, upload.array("files"), handleSendMail);

// Bulk email job tracking — delivery log dashboard
app.get("/bulk/jobs", authenticateUser, handleGetBulkJobs);
app.get("/bulk/jobs/:id/log", authenticateUser, handleGetBulkJobLog);

app.post("/enhance", authenticateUser, handleEnhanceSubject);
app.post("/generate", authenticateUser, handleGenerateHTMLBody);

module.exports = app;