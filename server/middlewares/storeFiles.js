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
  params: async (req, file) => ({
    folder: "scheduled-emails",
    resource_type: file.mimetype.startsWith("image/") ? "image" : "raw",
    public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
  }),
});

const scheduledUpload = multer({ storage });

const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "profile-photos",
    resource_type: "image",
    public_id: `user-${req.user.id}-${Date.now()}`,
    format: "jpg", // Convert all images to JPG for browser compatibility
    transformation: [{ width: 400, height: 400, crop: "limit", quality: "auto" }]
  }),
});

const profilePhotoUpload = multer({ 
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const processFiles = (req, res, next) => {
  console.log('=== Process Files ===');
  console.log('Number of files:', req.files ? req.files.length : 0);
  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, file.originalname, file.mimetype);
    });
  }
  const uploadedFiles = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  req.body.uploadedFiles = uploadedFiles;
  console.log('Files processed successfully');
  next();
}

module.exports = {
  upload,
  scheduledUpload,
  profilePhotoUpload,
  processFiles,
};
