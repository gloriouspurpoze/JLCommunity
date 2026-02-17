/**
 * Utility functions for handling Google Drive thumbnails with caching
 */

// In-memory caches to avoid regenerating the same URLs
const thumbnailCache = new Map()
const embedCache = new Map()

/**
 * Extract Google Drive file ID from various URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null
 */
export function extractDriveFileId(url) {
  if (!url) return null

  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]

  return null
}

/**
 * Get Google Drive thumbnail URL from video link (with caching)
 * @param {string} driveUrl - Full Google Drive URL
 * @param {number} size - Thumbnail size (default: 400)
 * @returns {string|null} - Thumbnail URL or null
 */
export function getDriveThumbnail(driveUrl, size = 400) {
  const cacheKey = `${driveUrl}_${size}`
  
  // Check cache first
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)
  }

  const fileId = extractDriveFileId(driveUrl)
  if (!fileId) {
    thumbnailCache.set(cacheKey, null)
    return null
  }

  // Use Google's thumbnail service
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
  
  // Cache the result
  thumbnailCache.set(cacheKey, thumbnailUrl)
  
  return thumbnailUrl
}

/**
 * Generate Google Drive embeddable video URL (with caching)
 * @param {string} driveUrl - Full Google Drive URL
 * @returns {string|null} - Embed URL or null
 */
export function getDriveEmbedUrl(driveUrl) {
  // Check cache first
  if (embedCache.has(driveUrl)) {
    return embedCache.get(driveUrl)
  }

  const fileId = extractDriveFileId(driveUrl)
  if (!fileId) {
    embedCache.set(driveUrl, null)
    return null
  }
  
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
  
  // Cache the result
  embedCache.set(driveUrl, embedUrl)
  
  return embedUrl
}

/**
 * Clear thumbnail caches (useful for testing or memory management)
 */
export function clearThumbnailCache() {
  thumbnailCache.clear()
  embedCache.clear()
}
