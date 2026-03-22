/**
 * Helper utility to return the correct absolute URL for an image.
 * This ensures that local paths (e.g. /images/watch.png) and 
 * external Cloudinary URLs (e.g. https://res.cloudinary.com/...)
 * both render correctly without breaking.
 */
export const getMediaUrl = (url) => {
  if (!url) return null;
  // If it's already an absolute URL (http/https/data), return as is
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) {
    return url;
  }
  // Otherwise, ensure it has a leading slash for local public assets
  return url.startsWith('/') ? url : `/${url}`;
};
