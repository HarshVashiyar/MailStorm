const express = require("express");
const app = express.Router();
const {
  handleGetAllUsers,
  handleGetUserByID,
  handleUserSignUp,
  handleUserSignIn,
  handleUserSignOut,
  handleRemoveUsers,
} = require("../controllers/userController");
const { checkForAuthorizationHeader, checkAdmin } = require("../utilities/userUtil");

app.get("/", (req, res) => {
  res.send("User router");
});

app.get("/getall", checkForAuthorizationHeader, checkAdmin, handleGetAllUsers);

app.get("/:id", handleGetUserByID);

app.post("/signup", handleUserSignUp);

app.post("/signin", handleUserSignIn);

app.post("/signout", handleUserSignOut);

app.delete("/remove", checkForAuthorizationHeader, checkAdmin, handleRemoveUsers);

module.exports = app;
