import api from './api'

/**
 * Comments API
 * Base: /projects/comments/
 */

/**
 * List comments for a project
 * @param {Object} params
 * @param {number} params.project_id - Project ID (required)
 * @param {number} [params.page] - Page number
 * @param {number} [params.page_size] - Items per page
 * @returns {Promise<{count, next, previous, results}>}
 */
export async function listComments(params) {
  return api.get('/comments/', { params })
}

/**
 * Get predefined comment options (for future use)
 * @returns {Promise<Array<string>>}
 */
export async function getCommentOptions() {
  return api.get('/comments/options/')
}

/**
 * Add a comment to a project
 * Requires Authorization header (handled by interceptor)
 * @param {Object} data
 * @param {number} data.project_id - Project ID
 * @param {string} data.username - Commenter username
 * @param {string} data.text - Comment text
 * @returns {Promise<{id, username, text, created_at, parent_uuid}>}
 */
export async function addComment(data) {
  return api.post('/comments/add/', data)
}

/**
 * Delete a comment
 * Requires Authorization header (handled by interceptor)
 * Owner only
 * @param {number} commentId - Comment ID
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}/`)
}
