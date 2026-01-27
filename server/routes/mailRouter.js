const express = require("express");
const app = express.Router();
const {
  handleSendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
  // handleGetQueueStats,
  // handleGetJobStatus,
  // handleGetJobHistory,
  // handleRetryJob,
  handleEnhanceSubject,
  handleGenerateHTMLBody
} = require("../controllers/mailController");
const { authenticateUser } = require("../utilities/userUtil");
const { upload } = require("../middlewares/storeFiles");

app.get("/", (req, res) => {
  res.send('Welcome to Mail Router');
});

app.post("/sendotp", handleSendOTP);

app.post("/verifyotp", handleVerifyOTP);

app.post("/resetpassword", handleResetPassword);

app.post("/sendmail", authenticateUser, upload.array("files"), handleSendMail);

// app.get("/stats", authenticateUser, handleGetQueueStats);

// app.get("/job/:jobId", authenticateUser, handleGetJobStatus);

// app.get("/jobs", authenticateUser, handleGetJobHistory);

// app.post("/job/:jobId/retry", authenticateUser, handleRetryJob);

app.post("/enhance", authenticateUser, handleEnhanceSubject);

app.post("/generate", authenticateUser, handleGenerateHTMLBody);

module.exports = app;