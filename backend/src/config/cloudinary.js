import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

// ==================== CLOUDINARY CONFIGURATION ====================
cloudinary.config({
  cloud_name: ENV.Cloud_Name,
  api_key: ENV.Cloud_API_KEY,
  api_secret: ENV.Cloud_API_SECRET,
  secure: true,
});

// ==================== UPLOAD SINGLE FILE ====================
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: options.folder || 'cmsfolder',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation || [],
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

// ==================== UPLOAD MULTIPLE FILES ====================
export const uploadMulterToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, {
        ...options,
        public_id: `${options.folder || 'healthcare'}/${Date.now()}-${file.originalname.split('.')[0]}`,
      })
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload multiple files to Cloudinary');
  }
};

// ==================== DELETE FILE ====================
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
};

// ==================== GET CLOUDINARY URL ====================
export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, { secure: true, ...options });
};

export default cloudinary;