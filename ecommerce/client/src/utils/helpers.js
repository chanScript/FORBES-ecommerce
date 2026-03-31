/**
 * Format a number as currency (PHP).
 */
export function formatPrice(price) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (num >= 1_000_000) {
    return `₱${(num / 1_000_000).toFixed(3)} Million`;
  }
  return `₱${num.toLocaleString('en-PH')}`;
}

/**
 * Format mileage with comma separator.
 */
export function formatMileage(km) {
  return `${Number(km).toLocaleString()} KM`;
}

/**
 * Get status badge class name.
 */
export function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'badge-pending';
    case 'Approved': return 'badge-approved';
    case 'Rejected': return 'badge-rejected';
    case 'Sold': return 'badge-sold';
    default: return '';
  }
}

/**
 * Optimize a Cloudinary image URL with width and auto quality/format.
 * Inserts transformation params before /upload/ or /v1/ segment.
 */
export function optimizeCloudinaryUrl(url, width = 400) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}
