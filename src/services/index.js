/**
 * Centralized API exports
 * Import services like: import { projects, reactions, auth } from '@/services'
 */

export * as projects from './projects'
export * as reactions from './reactions'
export * as parents from './parents'
export * as comments from './comments'
export * as learnRequests from './learnRequests'
export * as leaderboard from './leaderboard'
export * as auth from './auth'
export * as fingerprint from './fingerprint'

// Error handling utilities
export { ApiError, formatApiError, showErrorNotification, handleApiCall } from './errorHandler'
