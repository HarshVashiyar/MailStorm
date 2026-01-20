// const path = require("path");
const multer = require("multer");
const cloudinary = require("../utilities/cloudinary");
// const CloudinaryStorage = require("multer-storage-cloudinary").CloudinaryStorage || require("multer-storage-cloudinary");
const streamifier = require('streamifier'); // npm install streamifier

// Use memory storage first, then upload to Cloudinary in middleware
const memoryStorage = multer.memoryStorage();

// Generic upload for regular emails
const upload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const scheduledUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// const profilePhotoStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => ({
//     folder: "profile-photos",
//     resource_type: "image",
//     public_id: `user-${req.user.id}-${Date.now()}`,
//     format: "jpg", // Convert all images to JPG for browser compatibility
//     transformation: [{ width: 400, height: 400, crop: "limit", quality: "auto" }]
//   }),
// });

const profilePhotoUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Process files and upload to Cloudinary
const processFiles = async (req, res, next) => {
  console.log('=== Process Files ===');
  console.log('req.body:', req.body);
  console.log('Number of files:', req.files ? req.files.length : 0);
  
  if (!req.files || req.files.length === 0) {
    console.log('No files to process');
    return next();
  }
  
  try {
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw";
        const publicId = `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`;
        
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "scheduled-emails",
            resource_type: resourceType,
            public_id: publicId,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Uploaded to Cloudinary:', result.secure_url);
              resolve({
                path: result.secure_url,
                filename: file.originalname,
                mimetype: file.mimetype,
                originalname: file.originalname,
                publicId: result.public_id,
              });
            }
          }
        );
        
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });
    
    const uploadedFiles = await Promise.all(uploadPromises);
    
    // Replace req.files with uploaded file info
    req.files = uploadedFiles;
    
    console.log('All files processed successfully');
    next();
  } catch (error) {
    console.error('Error processing files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading files to Cloudinary',
      error: error.message
    });
  }
};

// Process profile photo
const processProfilePhoto = async (req, res, next) => {
  console.log('=== Process Profile Photo ===');
  
  if (!req.file) {
    console.log('No file to process');
    return next();
  }
  
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profile-photos",
          resource_type: "image",
          public_id: `user-${req.user.id}-${Date.now()}`,
          format: "jpg",
          transformation: [{ width: 400, height: 400, crop: "limit", quality: "auto" }]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Uploaded profile photo to Cloudinary:', result.secure_url);
            resolve({
              path: result.secure_url,
              filename: req.file.originalname,
              publicId: result.public_id,
            });
          }
        }
      );
      
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });
    
    const uploadedFile = await uploadPromise;
    req.file = uploadedFile;
    
    console.log('Profile photo processed successfully');
    next();
  } catch (error) {
    console.error('Error processing profile photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile photo to Cloudinary',
      error: error.message
    });
  }
};

module.exports = {
  upload, // Add this back for regular mail routes
  scheduledUpload,
  profilePhotoUpload,
  processFiles,
  processProfilePhoto,
};