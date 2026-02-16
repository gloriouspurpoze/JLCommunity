import api from './api'
import { setAuthToken, setParentInfo } from './auth'

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
 * Get parent profile
 * Requires Authorization header (handled by interceptor)
 * @param {string} parentUuid - Parent UUID
 * @returns {Promise<{uuid, name, email, phone_number, created_at}>}
 */
export async function getParentProfile(parentUuid) {
  return api.get(`/parents/${parentUuid}/`)
}

/**
 * List top creators (leaderboard)
 * NOTE: This endpoint doesn't exist in current API docs
 * Add to backend: GET /parents/top-creators/?limit=10
 * @param {Object} params
 * @param {number} [params.limit] - Number of creators to fetch (default: 10)
 * @returns {Promise<Array<{uuid, name, total_projects, total_reactions}>>}
 */
export async function listTopCreators(params = {}) {
  // TODO: Implement when backend endpoint is ready
  // return api.get('/parents/top-creators/', { params })
  
  // For now, throw error indicating endpoint not available
  throw new Error('Top creators endpoint not yet implemented in backend API')
}
