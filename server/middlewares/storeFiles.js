const path = require("path");
const multer = require("multer");
const cloudinary = require("../utilities/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const upload = multer({ storage: multer.memoryStorage() });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../public/uploads"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "scheduled-emails", // Folder in Cloudinary
    format: async (req, file) => "png", // You can change this to a dynamic format
    public_id: (req, file) => file.originalname, // Use the file's original name as the public ID
    //allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx", "txt"], // Allow only specific file types
  },
});

const scheduledUpload = multer({ storage });

const processFiles = (req, res, next) => {
  // Process uploaded files and attach them to req.body
  // if (!req.files || req.files.length === 0) {
  //   return res.status(400).json({ message: "No files uploaded." });
  // }

  // Map uploaded files to an array of their Cloudinary URLs
  const uploadedFiles = req.files.map((file) => ({
    url: file.path, // Cloudinary URL
    filename: file.filename, // File name on Cloudinary
  }));

  // Attach uploaded files to the request body
  req.body.uploadedFiles = uploadedFiles;

  // Proceed to the controller
  next();
}

module.exports = {
  upload,
  scheduledUpload,
  processFiles,
};
