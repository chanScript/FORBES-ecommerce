const sharp = require('sharp');
const { VARIANTS, WEBP_QUALITY } = require('../config/storage');

/**
 * Process an image buffer into multiple WebP variants.
 *
 * Steps per variant:
 *   1. Auto-orient (applies EXIF rotation, then strips metadata)
 *   2. Resize to target width (height auto, maintain aspect ratio)
 *   3. Convert to WebP with quality target
 *
 * @param {Buffer} buffer — raw image buffer from Multer
 * @returns {Promise<{ thumb: Buffer, medium: Buffer, large: Buffer }>}
 */
async function processImage(buffer) {
  const results = {};

  for (const [variant, width] of Object.entries(VARIANTS)) {
    results[variant] = await sharp(buffer)
      .rotate()                        // auto-orient from EXIF, then strip metadata
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

  return results;
}

module.exports = { processImage };
