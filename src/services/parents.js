import api from './api'
import { getParentInfo, setAuthToken, setParentInfo } from './auth'

/**
 * Parents API
 * Base: /projects/parents/
 */

/**
 * Create a parent account
 * Requires X-Browser-Fingerprint header (handled by interceptor)
 * Returns JWT token for authenticated actions
 * @param {Object} data
 * @param {string} data.name - Parent/child username
 * @param {string} [data.email] - Parent email (required if no phone)
 * @param {string} [data.phone_number] - Parent phone (required if no email)
 * @returns {Promise<{uuid, name, email, phone_number, jwt_token, created_at}>}
 */
export async function createParent(data) {
  const response = await api.post('/parents/', data)

  // Auto-save token and parent info
  if (response.jwt_token) {
    setAuthToken(response.jwt_token)
    setParentInfo({
      uuid: response.uuid,
      name: response.name,
      email: response.email,
      phone_number: response.phone_number,
    })
  }

  return response
}

/**
 * Try to get a new JWT using stored parent info (no user input).
 * Use when token is expired but we have parent_info in localStorage.
 * Sends stored email/phone + name to backend; backend must return 200 + jwt_token for existing user.
 * @returns {Promise<boolean>} true if a new token was obtained and saved
 */
export async function reauthenticateFromStoredParent() {
  const parentInfo = getParentInfo()
  if (!parentInfo?.name || (!parentInfo.email && !parentInfo.phone_number)) {
    return false
  }

  const payload = {
    name: parentInfo.name,
    ...(parentInfo.email
      ? { email: parentInfo.email }
      : { phone_number: parentInfo.phone_number }),
  }

  try {
    const response = await api.post('/parents/', payload)
    if (response?.jwt_token) {
      setAuthToken(response.jwt_token)
      setParentInfo({
        uuid: response.uuid,
        name: response.name,
        email: response.email,
        phone_number: response.phone_number,
      })
      return true
    }
  } catch (_) {
    // Backend returned 400 / not found / etc. – user must re-enter or backend doesn't support re-auth
  }
  return false
}

/**
 * Get parent profile
 * Requires Authorization header (handled by interceptor)
 * @param {string} parentUuid - Parent UUID
 * @returns {Promise<{uuid, name, email, phone_number, created_at}>}
 */
export async function getParentProfile(parentUuid) {
  return api.get(`/parents/${parentUuid}/`)
}

/**
 * @deprecated Use leaderboard service instead: import { leaderboard } from '../services'
 */
export async function listTopCreators(params = {}) {
  const { getLeaderboard } = await import('./leaderboard')
  return getLeaderboard(params)
}
