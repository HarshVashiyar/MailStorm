const User = require("../models/userDB");

const handleCheckAuthStatus = async (req, res) => {
    const user = req.user;
    try {
        if (!user) {
            return res.status(401).json({ success: false, isAuthenticated: false });
        }
        return res.status(200).json({ success: true, isAuthenticated: true });
    }
    catch (error) {
        console.error("Error checking authentication status:", error);
        return res.status(500).json({ success: false, isAuthenticated: false });
    }
}

const handleUserSignUp = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Full name, email and password are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with the provided email already exists" });
        }
        const newUser = new User({ fullName, email, password });
        await newUser.save();
        return res.status(201).json({ success: true, message: "User created successfully" });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        console.error("Error creating user:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const handleUserSignIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({ success: true, message: 'Logged in successfully' });
    }
    catch (error) {
        console.error("Error signing in user:", error);
        if (error.statusCode === 401 || error.statusCode === 404) {
            return res.status(401).json({ success: false, message: "Email or Password is incorrect." });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleGetAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        const data = users.map(user => ({
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            dob: user.dob,
            pathToProfilePhoto: user.pathToProfilePhoto,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        return res.status(200).json({ success: true, message: "Users fetched successfully", data });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleGetUserById = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            data: {
                fullName: user.fullName,
                role: user.role,
                email: user.email,
                dob: user.dob,
                pathToProfilePhoto: user.pathToProfilePhoto,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleUpdateUser = async (req, res) => {
    const { id } = req.user;
    const { fullName, email, password, dob, pathToProfilePhoto } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (password) user.password = password;
        if (dob) user.dob = dob;
        if (pathToProfilePhoto !== undefined) user.pathToProfilePhoto = pathToProfilePhoto;
        await user.save();
        return res.status(200).json({ success: true, message: "User updated successfully" });
    }
    catch (error) {
        console.error("Error updating user:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleDeleteUser = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.clearCookie("token");
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleLogout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Error logging out user:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    handleCheckAuthStatus,
    handleUserSignUp,
    handleUserSignIn,
    handleGetAllUsers,
    handleGetUserById,
    handleUpdateUser,
    handleDeleteUser,
    handleLogout,
};
