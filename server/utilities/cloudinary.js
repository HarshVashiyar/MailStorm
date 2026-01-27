require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name,
    api_key,
    api_secret
});

// ✅ Export configured cloudinary as default for backward compatibility
module.exports = cloudinary;

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} filename - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on MIME type
    let resourceType = 'raw'; // Default for documents, PDFs, etc.
    
    if (mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'email_attachments', // Organize in folder
        public_id: `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`, // Sanitize filename
        // Keep original filename in metadata
        context: `filename=${filename}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalFilename: filename,
        });
      }
    );

    // Write buffer to stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects with buffer, originalname, mimetype
 * @returns {Promise<Array>} Array of uploaded file info with URLs
 */
const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, file.originalname, file.mimetype)
      .then((result) => ({
        filename: file.originalname,
        path: result.url, // Cloudinary URL
        publicId: result.publicId,
        contentType: file.mimetype,
        size: file.size,
        storedIn: 'cloudinary', // Flag to indicate storage location
      }))
      .catch((error) => {
        console.error(`Failed to upload ${file.originalname}:`, error);
        throw error;
      })
  );

  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// ✅ Export functions as named exports
module.exports.uploadToCloudinary = uploadToCloudinary;
module.exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
module.exports.deleteFromCloudinary = deleteFromCloudinary;