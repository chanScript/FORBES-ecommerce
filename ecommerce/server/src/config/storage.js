const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ── Base Paths ──────────────────────────────────────────────
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');
const IMAGES_DIR = path.join(UPLOADS_ROOT, 'images');
const DOCUMENTS_DIR = path.join(UPLOADS_ROOT, 'documents');

// ── Image Variant Sizes (width in pixels) ───────────────────
const VARIANTS = {
  thumb: 300,
  medium: 600,
  large: 1000,
};

// ── WebP Quality (0–100) ────────────────────────────────────
const WEBP_QUALITY = 80;

// ── Helpers ─────────────────────────────────────────────────

/**
 * Ensure a directory exists; create it recursively if it doesn't.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate a unique ID and its hash-bucketed directory.
 * Returns { id, bucket, dirPath } where:
 *   - id:      e.g. "17123456789-a1b2c3d4"
 *   - bucket:  first 2 hex chars of a random hash, e.g. "a1"
 *   - dirPath: absolute directory path for the bucket
 */
function generateFilePath(baseDir) {
  const randomHex = crypto.randomBytes(4).toString('hex');
  const id = `${Date.now()}-${randomHex}`;
  const bucket = randomHex.slice(0, 2);
  const dirPath = path.join(baseDir, bucket);
  ensureDir(dirPath);
  return { id, bucket, dirPath };
}

/**
 * Ensure all top-level upload directories exist on startup.
 */
function initUploadDirs() {
  ensureDir(IMAGES_DIR);
  ensureDir(DOCUMENTS_DIR);
  console.log(`[Storage] Upload directories ready at ${UPLOADS_ROOT}`);
}

module.exports = {
  UPLOADS_ROOT,
  IMAGES_DIR,
  DOCUMENTS_DIR,
  VARIANTS,
  WEBP_QUALITY,
  ensureDir,
  generateFilePath,
  initUploadDirs,
};
