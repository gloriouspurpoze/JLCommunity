import api from './api'

/**
 * Leaderboard API
 * Base: /projects/leaderboard/
 */

/**
 * Get top creators leaderboard (live, refreshed daily)
 * @param {Object} [params]
 * @param {number} [params.limit] - Number of creators (default: 20)
 * @param {string} [params.course_name] - Filter by course
 * @returns {Promise<Array>}
 */
export async function getLeaderboard(params = {}) {
  return api.get('/leaderboard/', { params })
}

/**
 * Get weekly leaderboard (frozen snapshot, generated once per week)
 * @param {Object} [params]
 * @param {string} [params.week_start] - Monday date in YYYY-MM-DD (optional, defaults to current week)
 * @returns {Promise<{count, results, week_start, week_end}>}
 */
export async function getWeeklyLeaderboard(params = {}) {
  return api.get('/leaderboard/weekly/', { params })
}

/**
 * Get individual learner stats with rank
 * @param {string} learnerUid - Learner UID
 * @returns {Promise<Object>}
 */
export async function getLearnerStats(learnerUid) {
  return api.get(`/leaderboard/${learnerUid}/`)
}
