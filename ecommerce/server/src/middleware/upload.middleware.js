const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Use memory storage; we upload to Cloudinary manually in the controller helper.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Document upload — accepts images + PDF, 10 MB limit
const uploadDocs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and PDF files are allowed.'));
    }
  },
});

/**
 * Upload a single buffer to Cloudinary and return { public_id, secure_url }.
 */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'car-marketplace',
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId: result.public_id, url: result.secure_url });
      },
    );
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

/**
 * Upload a document (PDF or image) to Cloudinary.
 * PDFs use resource_type 'raw'; images use 'image'.
 */
function uploadDocToCloudinary(buffer, originalName) {
  const isPdf = originalName.toLowerCase().endsWith('.pdf');
  return new Promise((resolve, reject) => {
    const opts = {
      folder: 'car-marketplace/documents',
      resource_type: isPdf ? 'raw' : 'image',
      public_id: `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    };

    if (!isPdf) {
      opts.transformation = [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }];
    }

    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error);
      resolve({ publicId: result.public_id, url: result.secure_url });
    });
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

module.exports = { upload, uploadDocs, uploadToCloudinary, uploadDocToCloudinary };
