/**
 * Browser fingerprint utilities for anonymous user tracking
 * Used for reactions without authentication
 */

const FINGERPRINT_KEY = 'browser_fingerprint'

/**
 * Generate a simple browser fingerprint
 * In production, consider using libraries like fingerprintjs2
 */
function generateFingerprint() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('fingerprint', 2, 2)

  const dataUrl = canvas.toDataURL()
  const hash = dataUrl.split(',')[1].substring(0, 32)

  const navigatorInfo = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|')

  return `fp_${hash}_${btoa(navigatorInfo).substring(0, 16)}`
}

/**
 * Get or create browser fingerprint
 */
export function getBrowserFingerprint() {
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY)

  if (!fingerprint) {
    fingerprint = generateFingerprint()
    localStorage.setItem(FINGERPRINT_KEY, fingerprint)
  }

  return fingerprint
}

/**
 * Clear stored fingerprint (for testing)
 */
export function clearFingerprint() {
  localStorage.removeItem(FINGERPRINT_KEY)
}
