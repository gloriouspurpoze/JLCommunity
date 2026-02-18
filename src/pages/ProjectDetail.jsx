import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactionBar from '../components/ReactionBar'
import { projects, comments, parents, auth, learnRequests } from '../services'
import { getDriveThumbnail, getDriveEmbedUrl } from '../utils/thumbnails'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[\d\s\-().]{7,15}$/

function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim())
}

function isValidPhone(value) {
  return PHONE_REGEX.test(value.trim())
}

function isValidContact(value) {
  const trimmed = value.trim()
  if (!trimmed) return false
  return isValidEmail(trimmed) || isValidPhone(trimmed)
}

function getContactError(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Please enter an email or phone number'
  if (trimmed.includes('@')) {
    return isValidEmail(trimmed) ? '' : 'Please enter a valid email (e.g. parent@example.com)'
  }
  return isValidPhone(trimmed) ? '' : 'Please enter a valid phone number or Email (e.g. +1234567890 or parent@example.com)'
}

function ProjectDetail() {
  const { id } = useParams()
  
  // Project state (includes comments)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Details toggle state
  const [showDetails, setShowDetails] = useState(false)

  // Comment form state
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showComments, setShowComments] = useState(true) // Comments expanded by default
  const [commentStep, setCommentStep] = useState(1) // 1: phone/email, 2: username, 3: predefined comments
  const [parentContact, setParentContact] = useState('')
  const [contactError, setContactError] = useState('')
  const [username, setUsername] = useState('')
  const [selectedComment, setSelectedComment] = useState('')
  const [isCreatingParent, setIsCreatingParent] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Learn request state
  const [learnContactError, setLearnContactError] = useState('')
  const [showLearnRequestForm, setShowLearnRequestForm] = useState(false)
  const [showLearnRequestSuccess, setShowLearnRequestSuccess] = useState(false)
  const [learnRequestParentEmail, setLearnRequestParentEmail] = useState('')
  const [learnRequestStudentName, setLearnRequestStudentName] = useState('')
  const [learnRequestUsername, setLearnRequestUsername] = useState('')
  const [isSubmittingLearnRequest, setIsSubmittingLearnRequest] = useState(false)
  const [lastSubmittedLearnRequest, setLastSubmittedLearnRequest] = useState(null)

  // Predefined comment options
  const predefinedComments = [
    "That is so Cool",
    "Awesome!!",
    "I wanna make that too!",
    "I know how to make it : )",
    "This is amazing!",
    "Great work!",
    "Love it!",
    "Super creative!"
  ]

  // Scroll to top when navigating to a different project (layout uses overflow-y-auto, not window)
  const rootRef = useRef(null)
  useEffect(() => {
    const scrollContainer = rootRef.current?.closest('.overflow-y-auto') ?? document.querySelector('.overflow-y-auto')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [id])

  // Fetch project data with cache
  useEffect(() => {
    // Check cache first
    const cachedProject = localStorage.getItem(`project_${id}`)

    if (cachedProject) {
      setProject(JSON.parse(cachedProject))
      setLoading(false) // kill spinner early 💀
    }

    // Fetch fresh data in background
    fetchData()
  }, [id])
  
  async function fetchData() {
    setError(null)

    try {
      // Fetch project (includes comments and related projects)
      const projectData = await projects.getProjectDetail(id)

      setProject(projectData)

      // Update cache
      localStorage.setItem(`project_${id}`, JSON.stringify(projectData))
    } catch (err) {
      console.error('Failed to load project:', err)
      
      // If project fetch fails, show error
      if (err.status === 404) {
        setError(err.getUserMessage ? err.getUserMessage() : 'Project not found')
      } else {
        setError(err.getUserMessage ? err.getUserMessage() : 'Failed to load project')
      }
    } finally {
      setLoading(false)
    }
  }

  // Refresh project data after reaction update
  async function handleReactionUpdate() {
    try {
      const updated = await projects.getProjectDetail(id)
      setProject(updated)
      // Update cache
      localStorage.setItem(`project_${id}`, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to refresh project:', err)
    }
  }

  // Handle comment form steps
  async function handleAddCommentClick() {
    setShowCommentForm(true)

    const isAuth = auth.isAuthenticated()
    const tokenValid = isAuth && !auth.isTokenExpired()
    const parentInfo = auth.getParentInfo()

    if (tokenValid && parentInfo) {
      // Already have valid token – skip to comment selection
      setUsername(parentInfo.name)
      setCommentStep(3)
      return
    }

    // Token expired or not logged in but we have stored parent info – try to get new token without asking user
    if (parentInfo) {
      const reauthed = await parents.reauthenticateFromStoredParent()
      if (reauthed) {
        const updated = auth.getParentInfo()
        setUsername(updated?.name || parentInfo.name)
        setCommentStep(3)
        return
      }
    }

    // New user or re-auth failed – show form from step 1
    setCommentStep(1)
  }

  function handleParentContactSubmit(e) {
    e.preventDefault()
    const err = getContactError(parentContact)
    if (err) {
      setContactError(err)
      return
    }
    setContactError('')
    setCommentStep(2)
  }

  async function handleUsernameSubmit(e) {
    e.preventDefault()
    if (!username.trim()) return

    setIsCreatingParent(true)

    try {
      // Determine if parentContact is email or phone
      const isEmail = parentContact.includes('@')
      
      // Create parent account
      const parentData = {
        username: username,
        ...(isEmail ? { email: parentContact } : { phone_number: parentContact })
      }

      const response = await parents.createParent(parentData)
      
      // Verify token was saved
      if (response.jwt_token) {
        console.log('✅ Parent account created and JWT token saved')
      }

      // Move to step 3 (predefined comments)
      setCommentStep(3)
    } catch (err) {
      console.error('❌ Failed to create parent account:', err)
      
      // Check for specific error messages
      const errorMessage = err.getUserMessage ? err.getUserMessage() : 'Failed to create account. Please try again.'
      
      // Check if it's a duplicate account error
      if (err.status === 400 && errorMessage.includes('already exists')) {
        alert('This email/phone is already registered. If you have an account, your comment will use that account.')
        // Still proceed to comment selection since they might be authenticated
        setCommentStep(3)
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsCreatingParent(false)
    }
  }

  async function handleCommentSubmit(comment) {
    // Check if authenticated
    if (!auth.isAuthenticated()) {
      alert('Please complete the registration to comment.')
      setCommentStep(1)
      return
    }

    // Check if token is expired
    if (auth.isTokenExpired()) {
      alert('Your session has expired. Please register again.')
      auth.clearAuthToken()
      setCommentStep(1)
      return
    }

    setIsSubmittingComment(true)

    try {
      // Get current username from parent info or state
      const parentInfo = auth.getParentInfo()
      const currentUsername = parentInfo?.name || username

      // Submit comment to API (JWT token automatically attached by interceptor)
      await comments.addComment({
        project_id: parseInt(id),
        username: currentUsername,
        text: comment
      })

      console.log('✅ Comment submitted successfully')

      // Reset form
      setShowCommentForm(false)
      setCommentStep(1)
      setParentContact('')
      setUsername('')
      setSelectedComment('')

      // Refresh project data to show new comment
      await fetchData()
    } catch (err) {
      console.error('❌ Failed to submit comment:', err)
      
      // Handle 401 authentication errors
      if (err.status === 401) {
        alert('Your session has expired. Please register again.')
        auth.clearAuthToken()
        setCommentStep(1)
      } else {
        alert(err.getUserMessage ? err.getUserMessage() : 'Failed to submit comment. Please try again.')
      }
    } finally {
      setIsSubmittingComment(false)
    }
  }

  function closeCommentForm() {
    setShowCommentForm(false)
    setCommentStep(1)
    setParentContact('')
    setContactError('')
    setUsername('')
    setSelectedComment('')
  }

  // Learn request handlers
  async function handleLearnThisClick() {
    const isAuth = auth.isAuthenticated()
    const tokenValid = isAuth && !auth.isTokenExpired()
    const parentInfo = auth.getParentInfo()

    if (tokenValid) {
      await submitLearnRequest()
      return
    }

    // Token expired or not logged in – try to get new token from stored parent info (no form)
    if (parentInfo) {
      const reauthed = await parents.reauthenticateFromStoredParent()
      if (reauthed) {
        await submitLearnRequest()
        return
      }
    }

    // No stored parent or re-auth failed – show form
    setShowLearnRequestForm(true)
  }

  async function submitLearnRequest() {
    setIsSubmittingLearnRequest(true)

    try {
      await learnRequests.createLearnRequest({
        project_id: parseInt(id)
      })

      console.log('✅ Learn request submitted successfully')

      // Close form if open
      setShowLearnRequestForm(false)

      // Show success message
      setShowLearnRequestSuccess(true)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowLearnRequestSuccess(false)
      }, 10000)
    } catch (err) {
      console.error('❌ Failed to submit learn request:', err)
      alert(err.getUserMessage ? err.getUserMessage() : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmittingLearnRequest(false)
    }
  }

  async function handleLearnRequestFormSubmit(e) {
    e.preventDefault()
    
    if (!learnRequestParentEmail.trim() || !learnRequestStudentName.trim()) {
      alert('Please fill in all fields')
      return
    }

    const err = getContactError(learnRequestParentEmail)
    if (err) {
      setLearnContactError(err)
      return
    }
    setLearnContactError('')
    setIsSubmittingLearnRequest(true)

    try {
      // Determine if email or phone
      const isEmail = learnRequestParentEmail.includes('@')
      
      // Create parent account first
      await parents.createParent({
        child_name: learnRequestStudentName,
        username: learnRequestUsername,
        ...(isEmail ? { email: learnRequestParentEmail } : { phone_number: learnRequestParentEmail })
      })

      // Save details to show in success (before submit)
      setLastSubmittedLearnRequest({
        parentEmail: learnRequestParentEmail.trim(),
        studentName: learnRequestStudentName.trim(),
        username: learnRequestUsername.trim()
      })

      // Now submit learn request
      await submitLearnRequest()
    } catch (err) {
      console.error('❌ Failed to create parent or submit learn request:', err)
      alert(err.getUserMessage ? err.getUserMessage() : 'Failed to submit request. Please try again.')
      setIsSubmittingLearnRequest(false)
    }
  }

  function closeLearnRequestForm() {
    setShowLearnRequestForm(false)
    setLearnRequestParentEmail('')
    setLearnContactError('')
    setLearnRequestStudentName('')
  }

  // Refresh comments after adding or deleting
  async function refreshComments() {
    setCommentsError(null)
    setCommentsLoading(true)

    try {
      const data = await comments.listComments({ project_id: id })
      setProjectComments(data.results || [])
      // Update cache
      localStorage.setItem(`comments_${id}`, JSON.stringify(data.results || []))
    } catch (err) {
      console.error('Failed to refresh comments:', err)
      setCommentsError(err.getUserMessage ? err.getUserMessage() : 'Failed to load comments')
    } finally {
      setCommentsLoading(false)
    }
  }

  // Loading state - only show full page loader if no project data exists
  if (loading && !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-block w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading project...</span>
        </div>
      </div>
    )
  }

  // Error state - only show full page error if no project data exists
  if ((error || !project) && !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-brand-purple text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // If we don't have project data at this point, don't render the page
  if (!project) {
    return null
  }

  return (
    <div ref={rootRef} className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Error banner - show when error occurs but project data exists */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-red-500 text-2xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Failed to refresh project</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData()}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setError(null)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ── Main Content Column ── */}
          <div className="flex-1 min-w-0">
            
            {/* Title & Course Name */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {project.project_title || project.title}
              </h1>
              <p className="text-sm text-gray-600">
                Project Made on {project.course_name || 'JetLearn'}
              </p>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video bg-white rounded-2xl overflow-hidden shadow-lg relative mb-4">
              {getDriveEmbedUrl(project.project_video_recording) ? (
                <iframe
                  src={getDriveEmbedUrl(project.project_video_recording)}
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                  title={project.project_title || 'Project Video'}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-100">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="text-sm">No video available</span>
                </div>
              )}
            </div>
            {/* <VideoPlayer project={project} /> */}
            {/* Project Info & Reactions */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {project.project_title || project.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    by {project.learner_name || project.creator_name || 'Anonymous'}
                  </p>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <ReactionBar
                    projectId={project.id}
                    counts={project.reactions_breakdown || {}}
                    onReactionUpdate={handleReactionUpdate}
                  />
                </div>
              </div>

              {/* View/Hide Details Toggle */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                {showDetails ? 'Hide Details' : 'View Details'}
                <svg 
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Expandable Details Section */}
              {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {/* Project Description (if available) */}
                  {project.project_description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                      <p className="text-sm text-gray-600">{project.project_description}</p>
                    </div>
                  )}

                  {/* Course Name */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Course</h4>
                    <p className="text-sm text-gray-600">{project.course_name || 'JetLearn'}</p>
                  </div>

                  {/* Project Creation Date */}
                  {project.date_of_project_creation && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Created On</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(project.date_of_project_creation).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Total Reactions and Comments */}
                  {/* <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Reactions</h4>
                      <p className="text-sm text-gray-600">{project.total_reactions || 0}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Comments</h4>
                      <p className="text-sm text-gray-600">{project.total_comments || 0}</p>
                    </div>
                  </div> */}

                  {/* Learner Name */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Created By</h4>
                    <p className="text-sm text-gray-600">{project.learner_name || project.creator_name || 'Anonymous'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {project.total_comments || 0} Comments 💬
                  </h3>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    title={showComments ? "Hide comments" : "Show comments"}
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform ${showComments ? 'rotate-180' : ''}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <button 
                  onClick={handleAddCommentClick}
                  className="px-4 py-2 bg-brand-yellow text-gray-900 font-semibold text-sm rounded-full hover:opacity-90 transition-opacity"
                >
                  Add a Comment
                </button>
              </div>

              {/* Collapsible Comments Content */}
              {showComments && (
                <div>
                  {/* Multi-step Comment Form */}
                  {showCommentForm && (
                <div className="mb-6 bg-gray-50 border-2 border-gray-300 rounded-2xl p-6 relative">
                  {/* Close button */}
                  <button
                    onClick={closeCommentForm}
                    disabled={isSubmittingComment}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Step 1: Parent Contact */}
                  {commentStep === 1 && (
                    <form onSubmit={handleParentContactSubmit} className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        Enter Parent Phone/Email to continue
                      </h4>
                      <div className={`flex items-center gap-2 bg-white rounded-full px-4 py-3 shadow-sm ${contactError ? 'ring-2 ring-red-400' : ''}`}>
                        <input
                          type="text"
                          value={parentContact}
                          onChange={(e) => {
                            setParentContact(e.target.value)
                            if (contactError) setContactError('')
                          }}
                          placeholder="parent@example.com or +1234567890"
                          className="flex-1 outline-none text-sm"
                          required
                        />
                        <button
                          type="submit"
                          className="text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      {contactError && (
                        <p className="text-red-500 text-xs mt-2">{contactError}</p>
                      )}
                    </form>
                  )}

                  {/* Step 2: Username */}
                  {commentStep === 2 && (
                    <form onSubmit={handleUsernameSubmit} className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        What should we call you?
                      </h4>
                      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 shadow-sm">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter Username"
                          className="flex-1 outline-none text-sm text-gray-500 placeholder:text-gray-400"
                          required
                          disabled={isCreatingParent}
                        />
                        <button
                          type="submit"
                          disabled={isCreatingParent}
                          className="text-gray-900 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingParent ? (
                            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Predefined Comments */}
                  {commentStep === 3 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        Choose a comment
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {predefinedComments.map((comment, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedComment(comment)}
                            disabled={isSubmittingComment}
                            className={`
                              border-2 rounded-2xl px-4 py-3 text-sm transition-all text-left
                              ${selectedComment === comment
                                ? 'bg-brand-yellow border-brand-orange font-semibold shadow-md'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                              }
                              ${isSubmittingComment ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {comment}
                          </button>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={() => handleCommentSubmit(selectedComment)}
                        disabled={!selectedComment || isSubmittingComment}
                        className="w-full bg-brand-yellow text-gray-900 font-bold text-base py-3 rounded-full shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          'Submit Comment'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

                  {/* Comments List */}
                  <div className="space-y-3">
                    {(project.comments || []).length > 0 ? (
                      project.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">
                                {comment.username || 'Anonymous'}
                              </span>
                            </div>
                            <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                              <p className="text-sm text-gray-800">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-10 space-y-4">
              
              {/* CTA Button */}
              <button 
                onClick={handleLearnThisClick}
                disabled={isSubmittingLearnRequest}
                className="w-full bg-brand-yellow text-gray-900 font-bold text-base px-6 py-3 rounded-full shadow-md hover:opacity-90 transition-opacity flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmittingLearnRequest ? 'Submitting...' : 'I want to Learn this Too!'}</span>
                {!isSubmittingLearnRequest && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                {isSubmittingLearnRequest && (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                )}
              </button>

              {/* Success Message */}
              {showLearnRequestSuccess && (
                <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-4 text-center">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    We've Noted your learning request : )
                  </p>
                  <p className="text-xs text-green-700 mb-3">
                    We will connect your parent for the Same, Keep exploring.
                  </p>
                  {lastSubmittedLearnRequest && (
                    <div className="text-left text-xs text-green-800 bg-green-100/60 rounded-xl p-3 mb-3 space-y-1">
                      <p><span className="font-semibold">Parent contact:</span> {lastSubmittedLearnRequest.parentEmail}</p>
                      <p><span className="font-semibold">Student name:</span> {lastSubmittedLearnRequest.studentName}</p>
                      <p><span className="font-semibold">Username:</span> {lastSubmittedLearnRequest.username}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLearnRequestSuccess(false)
                      setShowLearnRequestForm(true)
                    }}
                    className="w-full text-sm font-semibold text-green-800 bg-green-200 hover:bg-green-300 py-2.5 rounded-full transition-colors"
                  >
                    Enter Details again
                  </button>
                </div>
              )}

              {/* Related Projects */}
              <div className="bg-gray-100 rounded-2xl p-4 h-[65vh] overflow-y-auto">
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  <span className="font-bold">Related To: </span>
                  <span className="text-gray-700">
                    {project.course_name || 'AI enabled Mobile Apps and Games'}
                  </span>
                </p>

                <div className="space-y-4">
                  {(project.related_projects || []).length > 0 ? 
                    project.related_projects.map((rp) => {
                      const thumbnailUrl = getDriveThumbnail(rp.project_video_recording, 400)
                      console.log('🎬 Related project:', {
                        title: rp.project_title,
                        videoUrl: rp.project_video_recording,
                        thumbnailUrl: thumbnailUrl,
                        hasVideoUrl: !!rp.project_video_recording,
                        hasThumbnail: !!thumbnailUrl
                      })
                      
                      return (
                        <Link
                          key={rp.id}
                          to={`/project/${rp.id}`}
                          className="block group"
                        >
                          {/* Mobile: Full width card with large thumbnail */}
                          <div className="lg:hidden bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-brand-purple transition-colors">
                            <div className="relative w-full aspect-video bg-gray-50">
                              {/* Always show placeholder, hide it on successful load */}
                              <div className="fallback-placeholder w-full h-full flex items-center justify-center bg-gray-100 absolute inset-0">
                                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              </div>
                              {thumbnailUrl && (
                                <img
                                  src={thumbnailUrl}
                                  alt={rp.project_title}
                                  className="w-full h-full object-cover absolute inset-0 z-10"
                                  loading="lazy"
                                  onLoad={(e) => {
                                    // Hide placeholder on successful load
                                    const parent = e.target.parentElement
                                    const placeholder = parent?.querySelector('.fallback-placeholder')
                                    if (placeholder) placeholder.style.display = 'none'
                                  }}
                                  onError={(e) => {
                                    console.log('❌ Mobile image failed to load:', thumbnailUrl)
                                    // Just hide the broken image, placeholder already visible
                                    e.target.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                                {rp.project_title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">by {rp.learner_name}</p>
                            </div>
                          </div>

                          {/* Desktop: Horizontal card with larger thumbnail */}
                          <div className="hidden lg:flex items-start gap-3 bg-white rounded-xl p-2 border-2 border-gray-200 hover:border-brand-purple transition-colors">
                            <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {/* Always show placeholder, hide it on successful load */}
                              <div className="fallback-placeholder w-full h-full flex items-center justify-center bg-gray-100 absolute inset-0">
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              </div>
                              {thumbnailUrl && (
                                <img
                                  src={thumbnailUrl}
                                  alt={rp.project_title}
                                  className="w-full h-full object-cover absolute inset-0 z-10"
                                  loading="lazy"
                                  onLoad={(e) => {
                                    // Hide placeholder on successful load
                                    const parent = e.target.parentElement
                                    const placeholder = parent?.querySelector('.fallback-placeholder')
                                    if (placeholder) placeholder.style.display = 'none'
                                  }}
                                  onError={(e) => {
                                    console.log('❌ Desktop image failed to load:', thumbnailUrl)
                                    // Just hide the broken image, placeholder already visible
                                    e.target.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 py-1">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-brand-purple transition-colors line-clamp-2 mb-1">
                                {rp.project_title}
                              </p>
                              <p className="text-xs text-gray-600">by {rp.learner_name}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                   : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No related projects yet
                    </p>
                  )}
                </div>

                
              </div>
              {/* View All Button */}
              <Link to="/" className="w-full mt-4 bg-brand-yellow text-gray-900 font-bold text-sm px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity flex items-center justify-between">
                  <span>Back to All Projects</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
               </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Learn Request Form Modal */}
      {showLearnRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeLearnRequestForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              I want to Learn this Too!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Please provide parent/guardian contact details
            </p>

            <form onSubmit={handleLearnRequestFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent Email or Phone Number
                </label>
                <input
                  type="text"
                  value={learnRequestParentEmail}
                  onChange={(e) => {
                    setLearnRequestParentEmail(e.target.value)
                    if (learnContactError) setLearnContactError('')
                  }}
                  placeholder="parent@example.com or +1234567890"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-brand-purple transition-colors ${learnContactError ? 'border-red-400' : 'border-gray-300'}`}
                  required
                  disabled={isSubmittingLearnRequest}
                />
                {learnContactError && (
                  <p className="text-red-500 text-xs mt-1">{learnContactError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={learnRequestStudentName}
                  onChange={(e) => setLearnRequestStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-brand-purple transition-colors"
                  required
                  disabled={isSubmittingLearnRequest}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={learnRequestUsername}
                  onChange={(e) => setLearnRequestUsername(e.target.value)}
                  placeholder="Enter a Cool Username for you (eg: JohnDoe123)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-brand-purple transition-colors"
                  required
                  disabled={isSubmittingLearnRequest}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLearnRequest}
                className="w-full bg-brand-yellow text-gray-900 font-bold text-base py-3 rounded-full shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingLearnRequest ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
