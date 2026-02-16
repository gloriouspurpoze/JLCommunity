/**
 * Error handling utilities for API responses
 * Converts technical errors into user-friendly messages
 */

/**
 * Map of common validation errors to user-friendly messages
 */
const VALIDATION_ERROR_MESSAGES = {
  // Reactions
  'reaction_type must be one of': 'Please select a valid reaction type',
  'X-Browser-Fingerprint header is required': 'Unable to process your reaction. Please refresh the page.',
  
  // Parents
  'Either email or phone_number is required': 'Please provide either an email or phone number',
  'Invalid email format': 'Please enter a valid email address',
  'Invalid phone number format': 'Please enter a valid phone number with country code',
  
  // Comments
  'Authentication required': 'Please sign up to add comments',
  'username is required': 'Please enter a username',
  'text is required': 'Comment text cannot be empty',
  'text must be at least': 'Comment is too short',
  'text exceeds maximum length': 'Comment is too long',
  
  // General
  'This field is required': 'Please fill in all required fields',
  'Invalid input': 'Please check your input and try again',
}

/**
 * Extract user-friendly message from validation error
 */
function parseValidationError(errorData) {
  if (!errorData) return null

  // Check for detail message
  if (errorData.detail) {
    for (const [key, message] of Object.entries(VALIDATION_ERROR_MESSAGES)) {
      if (errorData.detail.includes(key)) {
        return message
      }
    }
    return errorData.detail
  }

  // Check for field-specific errors
  if (typeof errorData === 'object') {
    const fieldErrors = []
    
    for (const [field, errors] of Object.entries(errorData)) {
      if (Array.isArray(errors)) {
        const fieldError = errors[0] // Take first error for each field
        fieldErrors.push(`${field}: ${fieldError}`)
      } else if (typeof errors === 'string') {
        fieldErrors.push(`${field}: ${errors}`)
      }
    }

    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ')
    }
  }

  return null
}

/**
 * Format API error into a user-friendly structure
 * @param {Object} error - Axios error object
 * @returns {Object} Formatted error
 */
export function formatApiError(error) {
  // Network error (no response from server)
  if (!error.response) {
    console.error('[API] Network error:', error.message)
    return {
      status: 0,
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      userMessage: 'Connection failed. Please check your internet and try again.',
      technicalDetails: error.message,
      shouldRetry: true,
    }
  }

  const { status, data } = error.response

  // Log technical details for debugging
  console.error(`[API] ${status} error:`, {
    url: error.config?.url,
    method: error.config?.method,
    status,
    data,
  })

  // Handle specific status codes
  switch (status) {
    case 400: {
      // Validation error
      const validationMessage = parseValidationError(data)
      
      return {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: validationMessage || 'Please check your input and try again.',
        userMessage: validationMessage || 'Invalid input. Please review your information.',
        fieldErrors: typeof data === 'object' && !data.detail ? data : null,
        technicalDetails: data,
        shouldRetry: false,
      }
    }

    case 401: {
      // Authentication error
      console.warn('[API] Authentication failed - clearing stored token')
      // Clear invalid token
      localStorage.removeItem('jwt_token')
      
      return {
        status: 401,
        type: 'AUTH_ERROR',
        message: 'Authentication required. Please sign up or log in.',
        userMessage: 'Please sign up to continue',
        technicalDetails: data,
        shouldRetry: false,
        requiresAuth: true,
      }
    }

    case 403: {
      // Permission denied
      return {
        status: 403,
        type: 'PERMISSION_ERROR',
        message: 'You don\'t have permission to perform this action.',
        userMessage: 'Access denied',
        technicalDetails: data,
        shouldRetry: false,
      }
    }

    case 404: {
      // Not found
      const resourceType = error.config?.url?.includes('project') ? 'project' :
                          error.config?.url?.includes('comment') ? 'comment' :
                          error.config?.url?.includes('parent') ? 'account' :
                          'resource'
      
      return {
        status: 404,
        type: 'NOT_FOUND',
        message: `The ${resourceType} you're looking for doesn't exist or has been removed.`,
        userMessage: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`,
        technicalDetails: data,
        shouldRetry: false,
      }
    }

    case 409: {
      // Conflict
      return {
        status: 409,
        type: 'CONFLICT',
        message: data?.detail || 'This action conflicts with existing data.',
        userMessage: 'This action cannot be completed',
        technicalDetails: data,
        shouldRetry: false,
      }
    }

    case 429: {
      // Rate limit
      return {
        status: 429,
        type: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment and try again.',
        userMessage: 'Please slow down and try again',
        technicalDetails: data,
        shouldRetry: true,
        retryAfter: error.response.headers?.['retry-after'],
      }
    }

    case 500:
    case 502:
    case 503:
    case 504: {
      // Server error
      return {
        status,
        type: 'SERVER_ERROR',
        message: 'Something went wrong on our end. Please try again later.',
        userMessage: 'Server error. Please try again later.',
        technicalDetails: data,
        shouldRetry: true,
      }
    }

    default: {
      // Unknown error
      return {
        status,
        type: 'UNKNOWN_ERROR',
        message: data?.detail || data?.message || 'An unexpected error occurred. Please try again.',
        userMessage: 'Something went wrong',
        technicalDetails: data,
        shouldRetry: false,
      }
    }
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(formattedError) {
    super(formattedError.message)
    this.name = 'ApiError'
    this.status = formattedError.status
    this.type = formattedError.type
    this.userMessage = formattedError.userMessage
    this.technicalDetails = formattedError.technicalDetails
    this.shouldRetry = formattedError.shouldRetry
    this.fieldErrors = formattedError.fieldErrors
    this.requiresAuth = formattedError.requiresAuth
    this.retryAfter = formattedError.retryAfter
  }

  /**
   * Get user-friendly message suitable for display
   */
  getUserMessage() {
    return this.userMessage
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError() {
    return this.type === 'AUTH_ERROR'
  }

  /**
   * Check if this is a validation error
   */
  isValidationError() {
    return this.type === 'VALIDATION_ERROR'
  }

  /**
   * Check if this error can be retried
   */
  canRetry() {
    return this.shouldRetry
  }

  /**
   * Get field-specific errors (for validation errors)
   */
  getFieldErrors() {
    return this.fieldErrors || {}
  }
}

/**
 * Show error notification to user (integrate with your toast/notification system)
 */
export function showErrorNotification(error) {
  const message = error instanceof ApiError ? error.getUserMessage() : error.message

  // TODO: Replace with your actual notification system
  // For now, just console.warn to show it's a user-facing error
  console.warn('[User Error]:', message)
  
  // Example integration with a toast library:
  // toast.error(message)
  
  // Or with a custom notification component:
  // NotificationService.error(message)
}

/**
 * Handle common error scenarios with automatic retry logic
 */
export async function handleApiCall(apiFunction, options = {}) {
  const { maxRetries = 1, retryDelay = 1000, onError } = options

  let lastError
  let attempts = 0

  while (attempts <= maxRetries) {
    try {
      return await apiFunction()
    } catch (error) {
      lastError = error instanceof ApiError ? error : new ApiError(formatApiError(error))
      attempts++

      // Don't retry if error shouldn't be retried or we've exhausted attempts
      if (!lastError.canRetry() || attempts > maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
      console.log(`[API] Retrying... (attempt ${attempts}/${maxRetries})`)
    }
  }

  // Call custom error handler if provided
  if (onError) {
    onError(lastError)
  }

  throw lastError
}
