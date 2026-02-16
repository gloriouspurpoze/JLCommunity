/**
 * Example React component showing error handling patterns
 * Copy these patterns into your actual components
 */

import { useState } from 'react'
import { projects, comments, reactions, parents } from './services'

// ────────────────────────────────────────────────────────────
// Example 1: Basic Error Display
// ────────────────────────────────────────────────────────────

function ProjectDetailExample({ projectId }) {
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadProject() {
    setError(null)
    setLoading(true)

    try {
      const data = await projects.getProjectDetail(projectId)
      setProject(data)
    } catch (err) {
      // Show user-friendly message
      setError(err.getUserMessage())
      // Technical details are already logged to console
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!project) return null

  return <div>{project.title}</div>
}

// ────────────────────────────────────────────────────────────
// Example 2: Handle Specific Error Types
// ────────────────────────────────────────────────────────────

function AddCommentExample({ projectId }) {
  const [error, setError] = useState(null)
  const [showSignup, setShowSignup] = useState(false)

  async function handleAddComment(username, text) {
    setError(null)

    try {
      await comments.addComment({
        project_id: projectId,
        username,
        text,
      })
      alert('Comment added!')
    } catch (err) {
      if (err.isAuthError()) {
        // Need to sign up first
        setShowSignup(true)
      } else if (err.isValidationError()) {
        // Show validation error
        setError(err.getUserMessage())
      } else {
        // Generic error
        setError(err.getUserMessage())
      }
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {showSignup ? (
        <div>Please sign up to comment</div>
      ) : (
        <button onClick={() => handleAddComment('TestUser', 'Great project!')}>
          Add Comment
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Example 3: Form with Field-Specific Validation Errors
// ────────────────────────────────────────────────────────────

function SignupFormExample() {
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone_number: formData.get('phone'),
    }

    try {
      await parents.createParent(data)
      setSuccess(true)
    } catch (error) {
      if (error.isValidationError()) {
        // Get field-specific errors
        const errors = error.getFieldErrors()
        setFieldErrors(errors)
        // Example: { email: ['Invalid email format'], name: ['Required'] }
      } else {
        setGeneralError(error.getUserMessage())
      }
    }
  }

  if (success) return <div>Account created successfully!</div>

  return (
    <form onSubmit={handleSubmit}>
      {generalError && <div className="error">{generalError}</div>}

      <div>
        <label>Name</label>
        <input name="name" />
        {fieldErrors.name && <span className="error">{fieldErrors.name[0]}</span>}
      </div>

      <div>
        <label>Email</label>
        <input name="email" type="email" />
        {fieldErrors.email && <span className="error">{fieldErrors.email[0]}</span>}
      </div>

      <div>
        <label>Phone</label>
        <input name="phone" />
        {fieldErrors.phone_number && (
          <span className="error">{fieldErrors.phone_number[0]}</span>
        )}
      </div>

      <button type="submit">Sign Up</button>
    </form>
  )
}

// ────────────────────────────────────────────────────────────
// Example 4: Automatic Retry on Network Errors
// ────────────────────────────────────────────────────────────

import { handleApiCall } from './services'

function ProjectListWithRetryExample() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadProjects() {
    setLoading(true)
    setError(null)

    try {
      // Automatically retries network errors up to 3 times
      const data = await handleApiCall(
        () => projects.listProjects({ page: 1 }),
        {
          maxRetries: 3,
          retryDelay: 1000,
          onError: (err) => {
            console.error('Failed after retries:', err)
          },
        }
      )
      setProjects(data.results)
    } catch (err) {
      setError(err.getUserMessage())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={loadProjects}>Retry</button>
        </div>
      )}
      {/* render projects */}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Example 5: Reaction Button with Error Handling
// ────────────────────────────────────────────────────────────

function ReactionButtonExample({ projectId }) {
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  async function handleReaction(reactionType) {
    setError(null)
    setProcessing(true)

    try {
      await reactions.createOrUpdateReaction({
        project_id: projectId,
        reaction_type: reactionType,
      })
      // Success - maybe refresh project data
    } catch (err) {
      if (err.status === 400) {
        // Validation error (e.g., invalid reaction type)
        setError(err.getUserMessage())
      } else if (err.type === 'NETWORK_ERROR') {
        setError('No internet connection')
      } else {
        setError('Unable to add reaction. Please try again.')
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      {error && <div className="error-toast">{error}</div>}
      <button
        onClick={() => handleReaction('love')}
        disabled={processing}
      >
        ❤️ Love
      </button>
      <button
        onClick={() => handleReaction('cool')}
        disabled={processing}
      >
        🔥 Cool
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Example 6: Error with Loading States
// ────────────────────────────────────────────────────────────

function CommentListExample({ projectId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadComments() {
    setLoading(true)
    setError(null)

    try {
      const data = await comments.listComments({ project_id: projectId })
      setComments(data.results)
    } catch (err) {
      setError({
        message: err.getUserMessage(),
        canRetry: err.canRetry(),
        type: err.type,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="spinner">Loading comments...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error.message}</p>
        {error.canRetry && (
          <button onClick={loadComments}>Try Again</button>
        )}
        {error.type === 'NOT_FOUND' && (
          <p>This project may have been removed.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>
          <strong>{comment.username}</strong>: {comment.text}
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Example 7: Custom Error Notification Hook
// ────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { showErrorNotification } from './services'

function useApiCall(apiFunction, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const result = await apiFunction()
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
          // Show toast notification
          showErrorNotification(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, dependencies)

  return { data, loading, error }
}

// Usage:
function ProjectWithHookExample({ projectId }) {
  const { data: project, loading, error } = useApiCall(
    () => projects.getProjectDetail(projectId),
    [projectId]
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.getUserMessage()}</div>
  return <div>{project?.title}</div>
}

export {
  ProjectDetailExample,
  AddCommentExample,
  SignupFormExample,
  ProjectListWithRetryExample,
  ReactionButtonExample,
  CommentListExample,
  useApiCall,
}
