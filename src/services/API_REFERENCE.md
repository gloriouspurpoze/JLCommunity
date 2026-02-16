# Complete API Functions Reference

All endpoints from the backend API documentation are implemented as frontend helper functions.

## Import

```javascript
import { projects, reactions, parents, comments, learnRequests } from './services'
```

---

## 📋 Projects API

### `listProjects(params)`
**Endpoint:** `GET /projects/`  
**Description:** List projects with optional filters, pagination, and search  
**Parameters:**
```javascript
{
  page: 1,              // Page number (optional, default: 1)
  page_size: 12,        // Items per page (optional, default: 12)
  search: 'robot',      // Search term (optional)
  course_name: 'Game Development',  // Filter by course (optional)
  ordering: '-total_reactions'      // Sort order (optional)
}
```
**Returns:** `{ count, next, previous, results: [] }`

**Example:**
```javascript
const data = await projects.listProjects({
  page: 1,
  page_size: 10,
  search: 'python',
  course_name: 'Web Development',
  ordering: '-total_reactions'
})
```

---

### `getProjectDetail(projectId)`
**Endpoint:** `GET /projects/{id}/`  
**Description:** Get detailed information for a single project  
**Parameters:**
- `projectId` (number|string) - Project ID

**Returns:** Project object with full details

**Example:**
```javascript
const project = await projects.getProjectDetail(471)
```

---

### `getCourseNames()`
**Endpoint:** `GET /projects/courses/`  
**Description:** Get list of available course names for filtering  
**Parameters:** None

**Returns:** Array of course name strings

**Example:**
```javascript
const courses = await projects.getCourseNames()
// ['Game Development', 'Web Development', 'AI & ML', ...]
```

---

## ❤️ Reactions API

**Reaction Types:** `"love"`, `"wow"`, `"funny"`, `"inspiring"`, `"cool"`

### `createOrUpdateReaction(data)`
**Endpoint:** `POST /projects/reactions/`  
**Description:** Add or update a reaction (anonymous or authenticated)  
**Auth:** Optional (fingerprint required)  
**Parameters:**
```javascript
{
  project_id: 471,           // Required
  reaction_type: 'love'      // Required: love, wow, funny, inspiring, cool
}
```
**Returns:** `{ uuid, reaction_type, created_at }`

**Example:**
```javascript
// Add reaction
const reaction = await reactions.createOrUpdateReaction({
  project_id: 471,
  reaction_type: 'love'
})

// Update reaction (same fingerprint/user)
await reactions.createOrUpdateReaction({
  project_id: 471,
  reaction_type: 'cool'
})
```

---

### `deleteReaction(reactionUuid)`
**Endpoint:** `DELETE /projects/reactions/{uuid}/`  
**Description:** Delete a reaction  
**Auth:** Fingerprint or JWT required (owner only)  
**Parameters:**
- `reactionUuid` (string) - Reaction UUID

**Returns:** void

**Example:**
```javascript
await reactions.deleteReaction('abc-123-def-456')
```

---

## 👨‍👩‍👧 Parents API

### `createParent(data)`
**Endpoint:** `POST /projects/parents/`  
**Description:** Create a parent account (required for comments)  
**Auth:** Fingerprint required  
**Parameters:**
```javascript
{
  name: 'CodeNinja42',              // Required
  email: 'parent@example.com',      // Optional (required if no phone)
  phone_number: '+919876543210'     // Optional (required if no email)
}
```
**Returns:** `{ uuid, name, email, phone_number, jwt_token, created_at }`

**Note:** JWT token is automatically saved to localStorage

**Example:**
```javascript
// With email
const parent = await parents.createParent({
  name: 'CodeNinja42',
  email: 'parent@example.com'
})

// With phone
const parent = await parents.createParent({
  name: 'RocketKid99',
  phone_number: '+919876543210'
})

// With both
const parent = await parents.createParent({
  name: 'PixelMaster',
  email: 'parent@example.com',
  phone_number: '+14155551234'
})
```

---

### `getParentProfile(parentUuid)`
**Endpoint:** `GET /projects/parents/{uuid}/`  
**Description:** Get parent profile information  
**Auth:** JWT required  
**Parameters:**
- `parentUuid` (string) - Parent UUID

**Returns:** `{ uuid, name, email, phone_number, created_at }`

**Example:**
```javascript
const profile = await parents.getParentProfile('parent-uuid-here')
```

---

## 💬 Comments API

### `listComments(params)`
**Endpoint:** `GET /projects/comments/`  
**Description:** Get comments for a project  
**Auth:** None  
**Parameters:**
```javascript
{
  project_id: 471,    // Required
  page: 1,            // Optional
  page_size: 10       // Optional
}
```
**Returns:** `{ count, next, previous, results: [] }`

**Example:**
```javascript
const data = await comments.listComments({
  project_id: 471,
  page: 1,
  page_size: 10
})
```

---

### `getCommentOptions()`
**Endpoint:** `GET /projects/comments/options/`  
**Description:** Get predefined comment options (future use)  
**Auth:** None  
**Parameters:** None

**Returns:** Array of predefined comment strings

**Example:**
```javascript
const options = await comments.getCommentOptions()
```

---

### `addComment(data)`
**Endpoint:** `POST /projects/comments/add/`  
**Description:** Add a comment to a project  
**Auth:** JWT required  
**Parameters:**
```javascript
{
  project_id: 471,                  // Required
  username: 'CoolCoder42',          // Required
  text: 'This is amazing!'          // Required
}
```
**Returns:** `{ id, username, text, created_at, parent_uuid }`

**Example:**
```javascript
const comment = await comments.addComment({
  project_id: 471,
  username: 'CoolCoder42',
  text: 'This project is so cool! I want to build something like this too!'
})
```

---

### `deleteComment(commentId)`
**Endpoint:** `DELETE /projects/comments/{id}/`  
**Description:** Delete a comment (owner only)  
**Auth:** JWT required  
**Parameters:**
- `commentId` (number) - Comment ID

**Returns:** void

**Example:**
```javascript
await comments.deleteComment(123)
```

---

## 🎓 Learn Requests API

### `createLearnRequest(data)`
**Endpoint:** `POST /projects/learn-request/`  
**Description:** Submit "I want to Learn this too!" request  
**Auth:** Optional (behavior differs)  
**Parameters:**
```javascript
{
  project_id: 471    // Required
}
```

**Returns:**
- Without JWT: `{ message, signup_url }`
- With JWT: `{ message, request_id }`

**Example:**
```javascript
// Without authentication
const response = await learnRequests.createLearnRequest({ project_id: 471 })
// { message: "...", signup_url: "https://..." }

// With authentication
const response = await learnRequests.createLearnRequest({ project_id: 471 })
// { message: "Request created", request_id: 123 }
```

---

## 🔐 Authentication Helpers

Authentication functions are separate from API calls:

```javascript
import { auth } from './services'

// Check authentication status
const isLoggedIn = auth.isAuthenticated()

// Get current parent info
const parentInfo = auth.getParentInfo()
// { uuid, name, email, phone_number }

// Get JWT token
const token = auth.getAuthToken()

// Logout
auth.clearAuthToken()

// Check if token is expired
const expired = auth.isTokenExpired()
```

---

## 🔑 Browser Fingerprint Helpers

For anonymous reactions:

```javascript
import { fingerprint } from './services'

// Get fingerprint (auto-generated)
const fp = fingerprint.getBrowserFingerprint()

// Clear fingerprint (for testing)
fingerprint.clearFingerprint()
```

---

## Summary: All 12 Endpoints Covered

| # | Method | Endpoint | Function | Auth Required |
|---|--------|----------|----------|---------------|
| 1 | GET | `/projects/` | `projects.listProjects()` | No |
| 2 | GET | `/projects/{id}/` | `projects.getProjectDetail()` | No |
| 3 | GET | `/projects/courses/` | `projects.getCourseNames()` | No |
| 4 | POST | `/projects/reactions/` | `reactions.createOrUpdateReaction()` | No* |
| 5 | DELETE | `/projects/reactions/{uuid}/` | `reactions.deleteReaction()` | No* |
| 6 | POST | `/projects/parents/` | `parents.createParent()` | No* |
| 7 | GET | `/projects/parents/{uuid}/` | `parents.getParentProfile()` | Yes |
| 8 | GET | `/projects/comments/` | `comments.listComments()` | No |
| 9 | GET | `/projects/comments/options/` | `comments.getCommentOptions()` | No |
| 10 | POST | `/projects/comments/add/` | `comments.addComment()` | Yes |
| 11 | DELETE | `/projects/comments/{id}/` | `comments.deleteComment()` | Yes |
| 12 | POST | `/projects/learn-request/` | `learnRequests.createLearnRequest()` | Optional |

\* Requires browser fingerprint (handled automatically)

---

## Error Handling

All functions return promises and throw structured errors:

```javascript
try {
  await projects.getProjectDetail(999999)
} catch (error) {
  console.error(error.status)   // 404
  console.error(error.message)  // "Resource not found"
  console.error(error.data)     // Full response data
}
```

**Common HTTP status codes:**
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid JWT)
- `404` - Not found
- `0` - Network error (offline/timeout)
