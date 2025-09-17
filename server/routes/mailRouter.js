const express = require("express");
const {
  sendOTP,
  handleVerifyOTP,
  handleResetPassword,
  handleSendMail,
} = require("../controllers/mailController");
const { upload } = require("../middlewares/storeFiles");
const app = express.Router();
const rateLimit = require("express-rate-limit");
const { checkForAuthorizationHeader, checkAdmin } = require("../utilities/userUtil");
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Try again later.",
  },
});

app.get("/", (req, res) => {
  res.send("Mail router");
});

app.post("/sendotp", otpLimiter, sendOTP);

app.post("/verifyotp", handleVerifyOTP);

app.post("/resetpassword", handleResetPassword);

app.post("/sendmail", checkForAuthorizationHeader, checkAdmin, upload.array("files"), handleSendMail);

module.exports = app;