import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadToCloudinary,uploadMulterToCloudinary, deleteFromCloudinary } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local storage for temporary files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

// ==================== MULTER UPLOAD CONFIGURATIONS ====================

// Single file upload (max 5MB)
export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
}).single('file');

// Single file upload with larger size (max 10MB)
export const uploadLargeSingle = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
}).single('file');

// Multiple files upload (max 5 files, 10MB each)
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter,
}).array('files', 5);

// Multiple files upload with more files (max 10 files)
export const uploadMultipleLarge = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter,
}).array('files', 10);

// Multiple files with different fields
export const uploadFields = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'certificates', maxCount: 5 },
]);

// ==================== CLOUDINARY UPLOAD FUNCTIONS ====================

// Upload single file to Cloudinary
export const uploadToCloudinarySingle = async (file, folder = 'healthcare', options = {}) => {
  try {
    if (!file) throw new Error('No file provided');
    
    const result = await uploadToCloudinary(file, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    // Clean up temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary single upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Upload multiple files to Cloudinary
export const uploadMultipleToCloudinaryFn = async (files, folder = 'healthcare', options = {}) => {
  try {
    if (!files || files.length === 0) throw new Error('No files provided');

    const results = await uploadMultipleToCloudinary(files, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    // Clean up temp files
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return results.map(result => ({
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    }));
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinaryFn = async (publicId) => {
  try {
    const result = await deleteFromCloudinary(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

//  ERROR HANDLING
