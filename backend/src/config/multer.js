import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');  /// created the folder named the uploads where we used to store the path of the file
const patientDir = path.join(uploadDir, 'patients');
const doctorDir = path.join(uploadDir, 'doctors');
const documentsDir = path.join(uploadDir, 'documents');

const directories = [uploadDir, patientDir, doctorDir, documentsDir];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); //  rahul.png  iwakshfkjdshfehsdih.png 
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

// Generate unique filename
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return uniqueSuffix + path.extname(file.originalname);
};

// Storage configuration for patient documents
export const patientStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, patientDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Storage configuration for doctor documents
export const doctorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, doctorDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Storage configuration for general documents
export const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// ==================== UPLOAD CONFIGURATIONS ====================

// Single file upload (profile picture)
export const uploadProfilePicture = multer({
  storage: patientStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
}).single('profilePicture');

// Single file upload (doctor certificate)
export const uploadCertificate = multer({
  storage: doctorStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
}).single('certificate');

// Single file upload (medical document)
export const uploadMedicalDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
}).single('document');

// Multiple files upload (multiple documents)
export const uploadMultipleDocuments = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter,
}).array('documents', 5); // Max 5 files

// Multiple files upload (patient documents)
export const uploadPatientDocuments = multer({
  storage: patientStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter,
}).array('documents', 10); // Max 10 files

// ==================== ERROR HANDLING ====================

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum file size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded. Maximum allowed is 5.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  
  if (err.message === 'Only images, PDFs, and documents are allowed') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next(err);
};

// ==================== FILE HELPER FUNCTIONS ====================

export const getFileUrl = (req, filename) => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${path.basename(filename)}`;
};

export const deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const getFileInfo = (filename) => {
  if (!filename) return null;
  return {
    filename: path.basename(filename),
    size: fs.statSync(filename)?.size || 0,
    ext: path.extname(filename),
    path: filename,
  };
};