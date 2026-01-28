const User = require("../models/userDB");
const cloudinary = require("../utilities/cloudinary");

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
        normalisedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalisedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with the provided email already exists" });
        }
        const newUser = new User({ fullName, email: normalisedEmail, password });
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
        const normalisedEmail = email.toLowerCase().trim();
        const token = await User.matchPasswordAndGenerateToken(normalisedEmail, password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
        const users = await User.find({ role: 'User' });
        const data = users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            dob: user.dob,
            profilePhoto: user.profilePhoto,
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
                _id: user._id,
                fullName: user.fullName,
                role: user.role,
                email: user.email,
                dob: user.dob,
                profilePhoto: user.profilePhoto,
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

const handleDeleteUsers = async (req, res) => {
    const { userIds } = req.body;
    try {
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "No users selected" });
        }

        // Import related models
        const Company = require("../models/companyDB");
        const List = require("../models/listDB");
        const Template = require("../models/templateDB");
        const ScheduledMail = require("../models/scheduledMailDB");

        // Cascade delete all resources created by these users
        await Promise.all([
            Company.deleteMany({ createdBy: { $in: userIds } }),
            List.deleteMany({ createdBy: { $in: userIds } }),
            Template.deleteMany({ createdBy: { $in: userIds } }),
            ScheduledMail.deleteMany({ createdBy: { $in: userIds } })
        ]);

        // Delete the users themselves
        const users = await User.deleteMany({ _id: { $in: userIds } });
        if (!users) {
            return res.status(404).json({ success: false, message: "Users not found" });
        }
        
       // Only clear cookie if current user deleted their own account
       if (userIds.includes(req.user.id)) {
         res.clearCookie("token");
       }
        
        return res.status(200).json({ success: true, message: "Users deleted successfully" });
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

const handleUploadProfilePhoto = async (req, res) => {
    const { id } = req.user;
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete old photo from Cloudinary if exists
        if (user.profilePhoto?.publicId) {
            try {
                await cloudinary.uploader.destroy(user.profilePhoto.publicId);
            } catch (deleteError) {
                console.error("Error deleting old profile photo:", deleteError);
            }
        }

        // Update user with new photo
        user.profilePhoto = {
            url: req.file.path,
            publicId: req.file.filename
        };
        await user.save({ validateModifiedOnly: true });

        return res.status(200).json({ 
            success: true, 
            message: "Profile photo uploaded successfully",
            data: {
                profilePhoto: user.profilePhoto
            }
        });
    }
    catch (error) {
        console.error("Error uploading profile photo:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

const handleDeleteProfilePhoto = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.profilePhoto?.publicId) {
            try {
                await cloudinary.uploader.destroy(user.profilePhoto.publicId);
            } catch (deleteError) {
                console.error("Error deleting profile photo from Cloudinary:", deleteError);
            }
        }

        user.profilePhoto = { url: "", publicId: "" };
        await user.save({ validateModifiedOnly: true });

        return res.status(200).json({ 
            success: true, 
            message: "Profile photo deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting profile photo:", error);
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
    handleDeleteUsers,
    handleLogout,
    handleUploadProfilePhoto,
    handleDeleteProfilePhoto,
};
