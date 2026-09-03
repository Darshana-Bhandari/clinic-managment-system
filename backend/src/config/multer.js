import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadToCloudinary, uploadMulterToCloudinary, deleteFromCloudinary } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== TEMP DISK STORAGE ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ==================== FILE FILTERS ====================

// Images only (for avatars/profile photos)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

// Documents + Images (for medical reports, certificates)
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/|application\/pdf|application\/msword|application\/vnd|text\/plain/.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Only images, PDFs, and documents are allowed'));
};

// ==================== MULTER UPLOAD INSTANCES ====================

// Single avatar/profile picture (5MB, images only)
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

// Single file upload for reports (10MB, docs+images)
export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).single('file');

// Multiple files (up to 5, 10MB each) — used for patient documents
export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).array('files', 5);

// Multiple files (up to 10, 10MB each) — used for doctor certificates
export const uploadMultipleLarge = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).array('files', 10);

// Named fields upload — profile picture + multiple documents
export const uploadFields = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'certificates', maxCount: 10 },
  { name: 'reportFile', maxCount: 1 },
]);

// ==================== CLOUDINARY HELPER FUNCTIONS ====================

// Clean up local temp file after upload
const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Failed to cleanup temp file:', err.message);
  }
};

/**
 * Upload a single file to Cloudinary and clean up temp.
 * @param {object} file  - Multer file object
 * @param {string} folder - Cloudinary folder
 * @param {object} options - Extra Cloudinary options
 * @returns {{ publicId, url, format, size, width, height }}
 */
export const uploadToCloudinarySingle = async (file, folder = 'healthcare', options = {}) => {
  if (!file) throw new Error('No file provided');

  try {
    const result = await uploadToCloudinary(file, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    cleanupTempFile(file.path);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    cleanupTempFile(file.path);
    console.error('Cloudinary single upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload multiple files to Cloudinary and clean up temps.
 * @param {object[]} files  - Array of Multer file objects
 * @param {string} folder - Cloudinary folder
 * @param {object} options - Extra Cloudinary options
 * @returns {Array<{ publicId, url, format, size, width, height }>}
 */
export const uploadMultipleToCloudinaryFn = async (files, folder = 'healthcare', options = {}) => {
  if (!files || files.length === 0) return [];

  try {
    const results = await uploadMulterToCloudinary(files, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    files.forEach((file) => cleanupTempFile(file.path));

    return results.map((result, index) => ({
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: files[index]?.originalname || '',
      uploadedAt: new Date().toISOString(),
    }));
  } catch (error) {
    files.forEach((file) => cleanupTempFile(file.path));
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 */
export const deleteFromCloudinaryFn = async (publicId) => {
  if (!publicId) return null;
  try {
    return await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Delete multiple files from Cloudinary.
 * @param {string[]} publicIds
 */
export const deleteMultipleFromCloudinary = async (publicIds = []) => {
  if (!publicIds || publicIds.length === 0) return;
  await Promise.allSettled(publicIds.map((id) => deleteFromCloudinaryFn(id)));
};