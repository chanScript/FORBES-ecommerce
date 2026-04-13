const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { IMAGES_DIR, DOCUMENTS_DIR, generateFilePath } = require('../config/storage');
const { processImage } = require('../utils/imageProcessor');

// Use memory storage; buffers are processed by Sharp before writing to disk.
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
 * Upload an image buffer to local disk as optimized WebP variants.
 * Returns { publicId, url } — publicId is "bucket/id", url is the large variant path.
 */
async function uploadImageLocal(buffer) {
  const { id, bucket, dirPath } = generateFilePath(IMAGES_DIR);

  // Process image into thumb, medium, large WebP variants
  const variants = await processImage(buffer);

  // Write all variants to disk
  for (const [variant, data] of Object.entries(variants)) {
    const filePath = path.join(dirPath, `${id}_${variant}.webp`);
    fs.writeFileSync(filePath, data);
  }

  const publicId = `${bucket}/${id}`;
  const url = `/uploads/images/${bucket}/${id}_large.webp`;

  return { publicId, url };
}

/**
 * Upload a document (PDF or image) to local disk.
 * Documents are stored as-is (no image processing).
 * Returns { publicId, url }.
 */
function uploadDocLocal(buffer, originalName, mimetype) {
  const { id, bucket, dirPath } = generateFilePath(DOCUMENTS_DIR);

  // Preserve original extension
  const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };
  const ext = extMap[mimetype] || path.extname(originalName) || '.bin';
  const fileName = `${id}${ext}`;
  const filePath = path.join(dirPath, fileName);

  fs.writeFileSync(filePath, buffer);

  const publicId = `${bucket}/${fileName}`;
  const url = `/uploads/documents/${bucket}/${fileName}`;

  return { publicId, url };
}

/**
 * Delete a locally stored file by its publicId.
 * For images: deletes all 3 variant files (thumb, medium, large).
 * For documents: deletes the single file.
 */
function deleteLocalFile(publicId, type = 'image') {
  try {
    if (type === 'image') {
      // publicId format: "bucket/id" — derive variant file paths
      const variants = ['thumb', 'medium', 'large'];
      for (const variant of variants) {
        const filePath = path.join(IMAGES_DIR, `${publicId}_${variant}.webp`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      // publicId format: "bucket/filename.ext"
      const filePath = path.join(DOCUMENTS_DIR, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('[Storage] Delete error:', err.message);
  }
}

module.exports = {
  upload,
  uploadDocs,
  uploadImageLocal,
  uploadDocLocal,
  deleteLocalFile,
};
