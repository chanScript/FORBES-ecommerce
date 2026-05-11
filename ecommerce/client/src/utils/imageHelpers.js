/**
 * Derive an image variant URL from the stored (large) image URL.
 *
 * Stored URLs look like: /uploads/images/a1/17123456789-a1b2c3d4_large.webp
 * Variants: _thumb.webp, _medium.webp, _large.webp
 *
 * @param {string} url — the image URL (stored as the _large variant)
 * @param {'thumb'|'medium'|'large'} variant — desired size
 * @returns {string} the variant URL, or empty string if url is falsy
 */
export function getImageUrl(url, variant = 'large') {
  if (!url) return '';
  return url.replace(/_large\.webp$/, `_${variant}.webp`);
}
