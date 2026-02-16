# Error Handling Guide

## Overview

The API layer provides automatic error handling that:
- ✅ Converts technical errors into user-friendly messages
- ✅ Logs detailed information for debugging
- ✅ Provides structured error objects
- ✅ Handles retries for recoverable errors
- ✅ Clears invalid auth tokens automatically

---

## Using API Functions with Error Handling

### Basic Usage

```javascript
import { projects } from './services'

try {
  const project = await projects.getProjectDetail(471)
  // Success - use project data
} catch (error) {
  // Error is automatically formatted
  console.log(error.userMessage)  // User-friendly message
  console.log(error.type)         // Error type (e.g., 'NOT_FOUND')
  console.log(error.status)       // HTTP status code
}
```

---

## Error Types

All errors are instances of `ApiError` with these properties:

```javascript
{
  status: 404,                    // HTTP status code
  type: 'NOT_FOUND',              // Error category
  message: 'Full technical message',
  userMessage: 'Short user-friendly message',
  technicalDetails: {...},        // Original error data
  shouldRetry: false,             // Whether error is retryable
  fieldErrors: {...},             // Field-specific errors (validation only)
  requiresAuth: false             // Whether auth is needed
}
```

### Available Error Types

| Type | Status | When It Occurs | Can Retry? |
|------|--------|----------------|------------|
| `VALIDATION_ERROR` | 400 | Invalid input data | No |
| `AUTH_ERROR` | 401 | Missing/invalid JWT | No |
| `PERMISSION_ERROR` | 403 | No permission | No |
| `NOT_FOUND` | 404 | Resource doesn't exist | No |
| `CONFLICT` | 409 | Data conflict | No |
| `RATE_LIMIT` | 429 | Too many requests | Yes |
| `SERVER_ERROR` | 500+ | Server is down | Yes |
| `NETWORK_ERROR` | 0 | No internet connection | Yes |
| `UNKNOWN_ERROR` | Other | Unexpected error | No |

---

## React Component Examples

### Show User-Friendly Error Messages

```jsx
import { useState } from 'react'
import { projects } from './services'

function ProjectPage({ projectId }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadProject() {
    setError(null)
    setLoading(true)
    
    try {
      const data = await projects.getProjectDetail(projectId)
      // Success
    } catch (err) {
      // Show user-friendly message
      setError(err.getUserMessage())
      // Technical details are logged automatically
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      {/* rest of component */}
    </div>
  )
}
```

---

### Handle Specific Error Types

```jsx
import { comments } from './services'

async function handleAddComment(data) {
  try {
    await comments.addComment(data)
    // Success
  } catch (error) {
    if (error.isAuthError()) {
      // Redirect to signup
      setShowSignupModal(true)
    } else if (error.isValidationError()) {
      // Show validation errors
      setFieldErrors(error.getFieldErrors())
    } else {
      // Show generic error
      setError(error.getUserMessage())
    }
  }
}
```

---

### Validation Errors with Field Mapping

```jsx
import { parents } from './services'

function SignupForm() {
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)

  async function handleSubmit(formData) {
    setFieldErrors({})
    setGeneralError(null)

    try {
      await parents.createParent(formData)
      // Success
    } catch (error) {
      if (error.isValidationError()) {
        // Get field-specific errors
        const errors = error.getFieldErrors()
        setFieldErrors(errors)
        // { email: ['Invalid email format'], phone_number: [...] }
      } else {
        setGeneralError(error.getUserMessage())
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {generalError && <div className="error">{generalError}</div>}
      
      <input name="email" />
      {fieldErrors.email && <span className="error">{fieldErrors.email[0]}</span>}
      
      <input name="phone" />
      {fieldErrors.phone_number && <span className="error">{fieldErrors.phone_number[0]}</span>}
    </form>
  )
}
```

---

### Automatic Retry on Network Errors

```jsx
import { handleApiCall } from './services/errorHandler'
import { projects } from './services'

async function loadProjectWithRetry(projectId) {
  try {
    const project = await handleApiCall(
      () => projects.getProjectDetail(projectId),
      {
        maxRetries: 3,        // Retry up to 3 times
        retryDelay: 1000,     // Wait 1s between retries
        onError: (error) => {
          console.error('All retries failed:', error)
        }
      }
    )
    return project
  } catch (error) {
    // Only throws if all retries fail
    setError(error.getUserMessage())
  }
}
```

---

### Custom Error Notification Integration

```jsx
// errorHandler.js - Update showErrorNotification

import { toast } from 'react-toastify' // or your notification library

export function showErrorNotification(error) {
  const message = error instanceof ApiError ? error.getUserMessage() : error.message
  
  if (error.type === 'AUTH_ERROR') {
    toast.warning(message)
  } else if (error.type === 'VALIDATION_ERROR') {
    toast.error(message)
  } else if (error.canRetry()) {
    toast.info(message + ' Please try again.')
  } else {
    toast.error(message)
  }
}

// Then in your component:
import { showErrorNotification } from './services/errorHandler'

try {
  await comments.addComment(data)
} catch (error) {
  showErrorNotification(error)
}
```

---

### Error Boundary for Unhandled Errors

```jsx
import { Component } from 'react'

class ApiErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Error Boundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.userMessage || 'Something went wrong'
      
      return (
        <div className="error-page">
          <h2>Oops!</h2>
          <p>{message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrap your app
<ApiErrorBoundary>
  <App />
</ApiErrorBoundary>
```

---

## Common Error Scenarios

### 1. Authentication Required (401)

```javascript
try {
  await comments.addComment({ project_id: 1, username: 'test', text: 'hi' })
} catch (error) {
  if (error.isAuthError()) {
    // Token is automatically cleared
    // Show signup form
    navigate('/signup')
  }
}
```

### 2. Validation Error (400)

```javascript
try {
  await reactions.createOrUpdateReaction({ 
    project_id: 1, 
    reaction_type: 'dislike'  // Invalid type
  })
} catch (error) {
  // error.userMessage => "Please select a valid reaction type"
  alert(error.getUserMessage())
}
```

### 3. Not Found (404)

```javascript
try {
  await projects.getProjectDetail(999999)
} catch (error) {
  // error.userMessage => "Project not found"
  // error.type => "NOT_FOUND"
  navigate('/404')
}
```

### 4. Network Error (0)

```javascript
try {
  await projects.listProjects()
} catch (error) {
  if (error.type === 'NETWORK_ERROR') {
    // error.userMessage => "Connection failed. Please check your internet..."
    setOfflineMode(true)
  }
}
```

---

## Error Messages Reference

### User-Friendly Messages by Scenario

| Backend Error | User-Friendly Message |
|---------------|----------------------|
| `X-Browser-Fingerprint header is required` | "Unable to process your reaction. Please refresh the page." |
| `Either email or phone_number is required` | "Please provide either an email or phone number" |
| `Invalid email format` | "Please enter a valid email address" |
| `Authentication required` | "Please sign up to add comments" |
| `reaction_type must be one of...` | "Please select a valid reaction type" |
| `text exceeds maximum length` | "Comment is too long" |
| Network timeout | "Connection failed. Please check your internet and try again." |
| 500 Internal Server Error | "Server error. Please try again later." |

---

## Best Practices

✅ **Always catch errors** from API calls
```javascript
// Good
try {
  await api.call()
} catch (error) {
  handleError(error)
}

// Bad
await api.call() // Unhandled rejection!
```

✅ **Show user-friendly messages**
```javascript
// Good
setError(error.getUserMessage())

// Bad
setError(error.technicalDetails)
```

✅ **Check error type before handling**
```javascript
if (error.isAuthError()) {
  // Handle auth
} else if (error.isValidationError()) {
  // Handle validation
}
```

✅ **Use automatic retry for network errors**
```javascript
await handleApiCall(() => api.call(), { maxRetries: 3 })
```

❌ **Don't show raw error objects to users**
```javascript
// Bad
alert(JSON.stringify(error))

// Good
alert(error.getUserMessage())
```

---

## Testing Error Scenarios

```javascript
// Force different error types for testing

// 404 Not Found
await projects.getProjectDetail(999999)

// 401 Auth Required
await comments.addComment({ project_id: 1, username: 'x', text: 'hi' })

// 400 Validation Error
await reactions.createOrUpdateReaction({ project_id: 1, reaction_type: 'invalid' })

// Network Error (turn off internet)
await projects.listProjects()
```
