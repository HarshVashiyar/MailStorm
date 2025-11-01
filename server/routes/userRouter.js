const express = require("express");
const app = express.Router();
const {
  handleCheckAuthStatus,
  handleUserSignUp,
  handleUserSignIn,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUser,
  handleDeleteUsers,
  handleLogout,
  handleUploadProfilePhoto,
  handleDeleteProfilePhoto,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizeAdmin,
  loginLimiter,
} = require("../utilities/userUtil");
const { profilePhotoUpload } = require("../middlewares/storeFiles");

app.get("/", (req, res) => {
  res.send("Welcome to User Router!");
});

app.get("/checkauth", authenticateUser, handleCheckAuthStatus);

app.post("/signup", handleUserSignUp);

app.post("/signin", loginLimiter, handleUserSignIn);

app.get("/getall", authenticateUser, handleGetAllUsers);

app.get("/getuser", authenticateUser, handleGetUserById);

app.put("/updateuser", authenticateUser, handleUpdateUser);

app.delete("/delete", authenticateUser, handleDeleteUsers);

app.post("/logout", authenticateUser, handleLogout);

app.post(
  "/addpp",
  authenticateUser,
  profilePhotoUpload.single("profilePhoto"),
  handleUploadProfilePhoto
);

app.delete("/deletepp", authenticateUser, handleDeleteProfilePhoto);

module.exports = app;
