const User = require("../models/userDB");

const handleGetAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "User" });
    return res.status(200).send(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
}

const handleGetUserByID = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");
    return res.status(200).send(user);
  }
  catch (err) {
    console.error("Get user by ID error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
}

const handleUserSignUp = async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("Email already in use!");

    const newUser = await User.create({ fullName, userName, email, password });
    return res.status(201).send(newUser);
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

const handleUserSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(401).send("Invalid email or password");
  }
};

const handleUserSignOut = (req, res) => {
  clearCookie(res, "token");
  res.status(200).send("Logged out successfully");
};

const handleRemoveUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: "No users selected" });
    }
    await User.deleteMany({ _id: { $in: userIds } });
    return res.status(200).json({ message: "Users deleted successfully" });
  } catch (error) {
    console.error("Error deleting users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleGetAllUsers,
  handleGetUserByID,
  handleUserSignUp,
  handleUserSignIn,
  handleUserSignOut,
  handleRemoveUsers,
};
