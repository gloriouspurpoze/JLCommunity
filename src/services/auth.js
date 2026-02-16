/**
 * Authentication utilities for JWT token management
 */

const TOKEN_KEY = 'jwt_token'
const PARENT_KEY = 'parent_info'

/**
 * Save JWT token to localStorage
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get JWT token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove JWT token from localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PARENT_KEY)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken()
}

/**
 * Save parent info to localStorage
 */
export function setParentInfo(parentData) {
  if (parentData) {
    localStorage.setItem(PARENT_KEY, JSON.stringify(parentData))
  }
}

/**
 * Get parent info from localStorage
 */
export function getParentInfo() {
  const data = localStorage.getItem(PARENT_KEY)
  return data ? JSON.parse(data) : null
}

/**
 * Decode JWT token (basic - does not verify signature)
 */
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token = null) {
  const tokenToCheck = token || getAuthToken()
  if (!tokenToCheck) return true

  const decoded = decodeToken(tokenToCheck)
  if (!decoded || !decoded.exp) return true

  return decoded.exp * 1000 < Date.now()
}
