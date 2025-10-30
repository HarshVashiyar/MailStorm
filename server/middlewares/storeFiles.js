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

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "scheduled-emails", // Folder in Cloudinary
//     resource_type: "auto", // Auto-detect resource type (image, video, raw for PDFs/docs)
//     public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`, // Unique filename without extension
//     // Removed allowed_formats to allow all file types
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "scheduled-emails",
    resource_type:
      file.mimetype.startsWith("image/")
        ? "image"
        : "raw", // ✅ Makes non-images (PDF, XLSX, etc.) accessible
    public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
  }),
});

const scheduledUpload = multer({ storage });

const processFiles = (req, res, next) => {
  console.log('=== Process Files ===');
  console.log('Number of files:', req.files ? req.files.length : 0);
  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, file.originalname, file.mimetype);
    });
  }
  
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

  console.log('Files processed successfully');
  // Proceed to the controller
  next();
}

module.exports = {
  upload,
  scheduledUpload,
  processFiles,
};
