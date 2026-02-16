import api from './api'

/**
 * Learn Requests API
 * Base: /projects/learn-request/
 * "I want to Learn this too!" button
 */

/**
 * Create a learn request
 * Without JWT: returns signup redirect URL
 * With JWT: creates request and returns confirmation
 * @param {Object} data
 * @param {number} data.project_id - Project ID
 * @returns {Promise<{message, signup_url} | {message, request_id}>}
 */
export async function createLearnRequest(data) {
  return api.post('/learn-request/', data)
}
