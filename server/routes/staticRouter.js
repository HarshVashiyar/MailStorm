const express = require("express");
const app = express();
const userRouter = require("./userRouter");
const mailRouter = require("./mailRouter");
const companyRouter = require("./companyRouter");
const listRouter = require("./listRouter");
const scheduledMailRouter = require("./scheduledMailRouter");
const templateRouter = require("./templateRouter");
const smtpRouter = require("./smtpRouter");
const oAuthRouter = require("./oAuthRouter");

app.get("/", (req, res) => {
  res.send("Welcome to Static Router!");
});

app.use("/user", userRouter);

app.use("/mail", mailRouter);

app.use("/company", companyRouter);

app.use("/list", listRouter);

app.use("/scheduled", scheduledMailRouter);

app.use("/template", templateRouter);

app.use("/smtp", smtpRouter);

app.use("/oauth", oAuthRouter);

module.exports = app;