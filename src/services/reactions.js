import api from './api'

/**
 * Reactions API
 * Base: /projects/reactions/
 * 
 * Reaction types: "love", "wow", "funny", "inspiring", "cool"
 */

/**
 * Create or update a reaction
 * Requires X-Browser-Fingerprint header (handled by interceptor)
 * @param {Object} data
 * @param {number} data.project_id - Project ID
 * @param {string} data.reaction_type - One of: love, wow, funny, inspiring, cool
 * @returns {Promise<{uuid, reaction_type, created_at}>}
 */
export async function createOrUpdateReaction(data) {
  return api.post('/reactions/', data)
}

/**
 * Delete a reaction
 * Requires X-Browser-Fingerprint or Authorization header
 * @param {string} reactionUuid - Reaction UUID
 * @returns {Promise<void>}
 */
export async function deleteReaction(reactionUuid) {
  return api.delete(`/reactions/${reactionUuid}/`)
}

/**
 * Reaction type constants for validation
 */
export const REACTION_TYPES = {
  LOVE: 'love',
  WOW: 'wow',
  FUNNY: 'funny',
  INSPIRING: 'inspiring',
  COOL: 'cool',
}

/**
 * Reaction emoji mapping
 */
export const REACTION_EMOJIS = {
  love: '❤️',
  wow: '😮',
  funny: '😂',
  inspiring: '🤩',
  cool: '🔥',
}
