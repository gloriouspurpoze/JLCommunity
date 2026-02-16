import api from './api'

/**
 * Projects API
 * Base: /projects/
 */

/**
 * List projects with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 12)
 * @param {string} params.course_name - Filter by course name
 * @param {string} params.search - Search term
 * @param {string} params.ordering - Sort order (e.g., "-total_reactions")
 * @returns {Promise<{count, next, previous, results}>}
 */
export async function listProjects(params = {}) {
  return api.get('/', { params })
}

/**
 * Get project detail by ID
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Object>}
 */
export async function getProjectDetail(projectId) {
  return api.get(`/${projectId}/`)
}

/**
 * Get available course names for filtering
 * @returns {Promise<Array<string>>}
 */
export async function getCourseNames() {
  return api.get('/courses/')
}
