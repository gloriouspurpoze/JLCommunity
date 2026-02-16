# API Services Layer

Frontend API layer for JetLearn Projects platform using axios.

## Setup

1. Copy `.env.example` to `.env.local` and configure your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000/projects
   ```

2. The services automatically handle:
   - JWT authentication (via `Authorization` header)
   - Browser fingerprinting (via `X-Browser-Fingerprint` header)
   - Error responses
   - Token storage

## Usage Examples

### Projects

```javascript
import { projects } from '@/services'

// List projects
const { results, count } = await projects.listProjects({
  page: 1,
  page_size: 12,
  search: 'robot',
  course_name: 'Game Development',
  ordering: '-total_reactions'
})

// Get project detail
const project = await projects.getProjectDetail(471)

// Get available courses
const courses = await projects.getCourseNames()
```

### Reactions (Anonymous or Authenticated)

```javascript
import { reactions } from '@/services'

// Add reaction (fingerprint auto-added)
const reaction = await reactions.createOrUpdateReaction({
  project_id: 471,
  reaction_type: 'love'
})

// Change reaction (same fingerprint = update)
await reactions.createOrUpdateReaction({
  project_id: 471,
  reaction_type: 'cool'
})

// Delete reaction
await reactions.deleteReaction(reaction.uuid)

// Available types
const { REACTION_TYPES, REACTION_EMOJIS } = reactions
```

### Parent Account (Required for Comments)

```javascript
import { parents, auth } from '@/services'

// Create account (auto-saves JWT token)
const parent = await parents.createParent({
  name: 'CodeNinja42',
  email: 'parent@example.com'
  // OR phone_number: '+919876543210'
})

// Token is auto-stored, check if logged in
if (auth.isAuthenticated()) {
  console.log('Logged in!', auth.getParentInfo())
}

// Get profile
const profile = await parents.getParentProfile(parent.uuid)

// Logout
auth.clearAuthToken()
```

### Comments (Requires Authentication)

```javascript
import { comments } from '@/services'

// List comments
const { results } = await comments.listComments({
  project_id: 471,
  page: 1
})

// Add comment (JWT auto-added from auth)
const comment = await comments.addComment({
  project_id: 471,
  username: 'CoolCoder42',
  text: 'This is amazing!'
})

// Delete comment (owner only)
await comments.deleteComment(comment.id)

// Get predefined options
const options = await comments.getCommentOptions()
```

### Learn Requests

```javascript
import { learnRequests, auth } from '@/services'

// Without auth: get signup URL
if (!auth.isAuthenticated()) {
  const { signup_url } = await learnRequests.createLearnRequest({
    project_id: 471
  })
  window.location.href = signup_url
}

// With auth: create request
const { message, request_id } = await learnRequests.createLearnRequest({
  project_id: 471
})
```

## Error Handling

All API calls return promises. Errors are structured:

```javascript
try {
  await projects.getProjectDetail(999999)
} catch (error) {
  console.error(error.status)   // 404
  console.error(error.message)  // "Resource not found"
  console.error(error.data)     // Full error response
}
```

Common error codes:
- `400` - Validation error (missing fields, invalid data)
- `401` - Authentication required (JWT missing/invalid)
- `404` - Resource not found
- `0` - Network error (offline, timeout)

## Authentication Flow

```javascript
import { parents, auth, comments } from '@/services'

// 1. Create parent account
const parent = await parents.createParent({
  name: 'MyUsername',
  email: 'parent@example.com'
})
// Token auto-saved to localStorage

// 2. Now you can add comments
await comments.addComment({
  project_id: 471,
  username: 'MyUsername',
  text: 'Great project!'
})

// 3. Check auth status anytime
if (auth.isAuthenticated()) {
  const info = auth.getParentInfo()
  console.log('Logged in as:', info.name)
}

// 4. Logout
auth.clearAuthToken()
```

## Browser Fingerprinting

Anonymous actions (reactions) use a fingerprint for tracking:

```javascript
import { fingerprint } from '@/services'

// Auto-generated and stored on first use
const fp = fingerprint.getBrowserFingerprint()
console.log(fp) // "fp_abc123_xyz789"

// Clear for testing
fingerprint.clearFingerprint()
```

## API Reference

### projects
- `listProjects(params)` - GET /
- `getProjectDetail(id)` - GET /{id}/
- `getCourseNames()` - GET /courses/

### reactions
- `createOrUpdateReaction(data)` - POST /reactions/
- `deleteReaction(uuid)` - DELETE /reactions/{uuid}/

### parents
- `createParent(data)` - POST /parents/
- `getParentProfile(uuid)` - GET /parents/{uuid}/

### comments
- `listComments(params)` - GET /comments/
- `getCommentOptions()` - GET /comments/options/
- `addComment(data)` - POST /comments/add/
- `deleteComment(id)` - DELETE /comments/{id}/

### learnRequests
- `createLearnRequest(data)` - POST /learn-request/

### auth utilities
- `setAuthToken(token)`
- `getAuthToken()`
- `clearAuthToken()`
- `isAuthenticated()`
- `setParentInfo(data)`
- `getParentInfo()`
- `decodeToken(token)`
- `isTokenExpired(token)`

### fingerprint utilities
- `getBrowserFingerprint()`
- `clearFingerprint()`
