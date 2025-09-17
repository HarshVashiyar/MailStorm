const express = require("express");
const app = express();
const userRouter = require("./userRouter");
const mailRouter = require("./mailRouter");
const companyRouter = require("./companyRouter");
const listRouter = require("./listRouter");
const scheduledEmailRouter = require("./scheduledEmailRouter");
const { checkForAuthorizationHeader, checkAdmin } = require("../utilities/userUtil");

app.get("/", (req, res) => {
  res.send("Static router");
});

app.use("/user", userRouter);

app.use("/mail", mailRouter);

app.use("/company", checkForAuthorizationHeader, checkAdmin, companyRouter);

app.use("/list", checkForAuthorizationHeader, checkAdmin, listRouter);

app.use("/scheduled", checkForAuthorizationHeader, checkAdmin, scheduledEmailRouter);

module.exports = app;
