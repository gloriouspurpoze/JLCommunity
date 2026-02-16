import axios from 'axios'
import { getAuthToken } from './auth'
import { getBrowserFingerprint } from './fingerprint'

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/projects'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: add auth token and fingerprint
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add browser fingerprint for anonymous actions
    const fingerprint = getBrowserFingerprint()
    if (fingerprint) {
      config.headers['X-Browser-Fingerprint'] = fingerprint
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Import error handler dynamically to avoid circular dependency
    const { formatApiError, ApiError } = require('./errorHandler')
    
    const formattedError = formatApiError(error)
    return Promise.reject(new ApiError(formattedError))
  }
)

export default api
