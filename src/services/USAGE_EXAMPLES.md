# React Component Usage Examples

## Complete Flow: Project Detail Page with Reactions & Comments

```jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { projects, reactions, comments, parents, auth } from '@/services'

function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [projectComments, setProjectComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated())

  // Load project data
  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, commentsData] = await Promise.all([
          projects.getProjectDetail(id),
          comments.listComments({ project_id: id })
        ])
        setProject(projectData)
        setProjectComments(commentsData.results)
      } catch (error) {
        console.error('Failed to load project:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  // Handle reaction
  async function handleReaction(reactionType) {
    try {
      await reactions.createOrUpdateReaction({
        project_id: project.id,
        reaction_type: reactionType
      })
      // Reload project to get updated counts
      const updated = await projects.getProjectDetail(id)
      setProject(updated)
    } catch (error) {
      console.error('Reaction failed:', error)
    }
  }

  // Handle comment submission
  async function handleComment(username, text) {
    if (!isAuthenticated) {
      alert('Please create an account to comment')
      return
    }

    try {
      const newComment = await comments.addComment({
        project_id: project.id,
        username,
        text
      })
      setProjectComments([newComment, ...projectComments])
    } catch (error) {
      console.error('Comment failed:', error.message)
    }
  }

  // Handle parent signup
  async function handleSignup(name, email) {
    try {
      const parent = await parents.createParent({ name, email })
      setIsAuthenticated(true)
      alert(`Welcome, ${parent.name}!`)
    } catch (error) {
      console.error('Signup failed:', error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>{project.title}</h1>
      
      {/* Reactions */}
      <div className="reactions">
        {Object.entries(reactions.REACTION_EMOJIS).map(([type, emoji]) => (
          <button key={type} onClick={() => handleReaction(type)}>
            {emoji} {project[`${type}_count`] || 0}
          </button>
        ))}
      </div>

      {/* Comments */}
      <div className="comments">
        <h2>{projectComments.length} Comments</h2>
        
        {!isAuthenticated && (
          <SignupForm onSubmit={handleSignup} />
        )}
        
        {isAuthenticated && (
          <CommentForm onSubmit={handleComment} />
        )}

        {projectComments.map(comment => (
          <div key={comment.id}>
            <strong>{comment.username}</strong>: {comment.text}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Projects List with Filters

```jsx
import { useState, useEffect } from 'react'
import { projects } from '@/services'

function ProjectsPage() {
  const [projectsList, setProjectsList] = useState([])
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 12,
    search: '',
    course_name: '',
    ordering: '-total_reactions'
  })
  const [courses, setCourses] = useState([])

  useEffect(() => {
    // Load available courses for filter
    projects.getCourseNames().then(setCourses)
  }, [])

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projects.listProjects(filters)
        setProjectsList(data.results)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }
    loadProjects()
  }, [filters])

  function handleSearch(value) {
    setFilters({ ...filters, search: value, page: 1 })
  }

  function handleCourseFilter(courseName) {
    setFilters({ ...filters, course_name: courseName, page: 1 })
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search projects..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <select onChange={(e) => handleCourseFilter(e.target.value)}>
        <option value="">All Courses</option>
        {courses.map(course => (
          <option key={course} value={course}>{course}</option>
        ))}
      </select>

      <div className="grid">
        {projectsList.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

## Learn Request Button

```jsx
import { useState } from 'react'
import { learnRequests, auth } from '@/services'

function LearnButton({ projectId }) {
  const [loading, setLoading] = useState(false)

  async function handleLearnRequest() {
    setLoading(true)
    try {
      const response = await learnRequests.createLearnRequest({ project_id: projectId })
      
      if (response.signup_url) {
        // Not authenticated - redirect to signup
        window.location.href = response.signup_url
      } else {
        // Authenticated - show success
        alert(response.message)
      }
    } catch (error) {
      console.error('Learn request failed:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLearnRequest} disabled={loading}>
      {loading ? 'Processing...' : 'I want to Learn this Too!'}
    </button>
  )
}
```

## Authentication Context (Optional)

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '@/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const parentInfo = auth.getParentInfo()
    const token = auth.getAuthToken()

    if (parentInfo && token && !auth.isTokenExpired(token)) {
      setUser(parentInfo)
    }
    setLoading(false)
  }, [])

  const login = (parentData, token) => {
    auth.setAuthToken(token)
    auth.setParentInfo(parentData)
    setUser(parentData)
  }

  const logout = () => {
    auth.clearAuthToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Usage in component:
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )
}
```

## Error Handling Pattern

```jsx
import { useState } from 'react'
import { comments } from '@/services'

function CommentForm({ projectId }) {
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData) {
    setError(null)
    setSubmitting(true)

    try {
      await comments.addComment({
        project_id: projectId,
        username: formData.username,
        text: formData.text
      })
      // Success - clear form
    } catch (err) {
      // Handle different error types
      switch (err.status) {
        case 401:
          setError('Please login to comment')
          break
        case 400:
          setError(err.message || 'Invalid input')
          break
        case 0:
          setError('Network error. Please check your connection.')
          break
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* form fields */}
      <button disabled={submitting}>
        {submitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}
```

## Custom Hook for Project Data

```jsx
import { useState, useEffect } from 'react'
import { projects } from '@/services'

export function useProject(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return

    async function loadProject() {
      try {
        const data = await projects.getProjectDetail(projectId)
        setProject(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await projects.getProjectDetail(projectId)
      setProject(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { project, loading, error, refresh }
}

// Usage:
function ProjectPage() {
  const { id } = useParams()
  const { project, loading, error, refresh } = useProject(id)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>{project.title}</h1>
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```
