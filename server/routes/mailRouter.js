const express = require("express");
const app = express.Router();
const {
  handleSendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
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

module.exports = app;