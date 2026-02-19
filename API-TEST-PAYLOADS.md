# JetProjects API — Test Payloads (Windows CMD/PowerShell)

**Base URL:** `http://localhost:8000/projects`  
**Production:** `https://live.jetlearn.com/projects`

> Replace `{{PROJECT_ID}}` with a real project ID from your database.  
> Replace `{{JWT_TOKEN}}` with the token returned from Create Parent.  
> Replace `{{REACTION_UUID}}` with the UUID returned from Create Reaction.  
> Replace `{{PARENT_UUID}}` with the UUID returned from Create Parent.  
> Replace `{{COMMENT_ID}}` with the ID returned from Create Comment.  
> Replace `{{LEARNER_UID}}` with a learner_uid from the leaderboard or project response.

---

## 1. List Projects

```powershell
# Basic (default: page 1, 12 per page)
Invoke-RestMethod -Uri "http://localhost:8000/projects/" -Method GET

# With pagination
Invoke-RestMethod -Uri "http://localhost:8000/projects/?page=1&page_size=6" -Method GET

# Filter by course name
Invoke-RestMethod -Uri "http://localhost:8000/projects/?course_name=Game%20Development" -Method GET

# Search
Invoke-RestMethod -Uri "http://localhost:8000/projects/?search=robot" -Method GET

# Order by most reactions
Invoke-RestMethod -Uri "http://localhost:8000/projects/?ordering=-total_reactions" -Method GET

# Combined: search + filter + pagination
Invoke-RestMethod -Uri "http://localhost:8000/projects/?search=python&course_name=Web%20Development&page=1&page_size=10&ordering=-total_reactions" -Method GET
```

---

## 2. Get Project Detail

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/1/" -Method GET

Invoke-RestMethod -Uri "http://localhost:8000/projects/{{PROJECT_ID}}/" -Method GET
```

---

## 3. Get Course Names (for filters)

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/courses/" -Method GET
```

---

## 4. Create / Update Reaction (Anonymous)

**Reaction types:** `love`, `wow`, `funny`, `inspiring`, `cool`

```powershell
# Add a "love" reaction
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"} -Body '{"project_id": 471, "reaction_type": "love"}'

# Change reaction to "cool" (same fingerprint = update)
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"} -Body '{"project_id": 471, "reaction_type": "cool"}'

# Add "wow" from a different device
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="another-device-xyz789"} -Body '{"project_id": 471, "reaction_type": "wow"}'

# With JWT (verified reaction)
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"; "Authorization"="Bearer {{JWT_TOKEN}}"} -Body '{"project_id": 471, "reaction_type": "inspiring"}'
```

---

## 5. Delete Reaction

```powershell
# Delete by fingerprint (anonymous owner)
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/{{REACTION_UUID}}/" -Method DELETE -Headers @{"X-Browser-Fingerprint"="test-device-abc123"}

# Delete by JWT (verified owner)
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/{{REACTION_UUID}}/" -Method DELETE -Headers @{"Authorization"="Bearer {{JWT_TOKEN}}"}
```

---

## 6. Create Parent Account

> **Do this FIRST** to get a JWT token for comment & learn-request endpoints.

```powershell
# With email
Invoke-RestMethod -Uri "http://localhost:8000/projects/parents/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"} -Body '{"name": "CodeNinja42", "email": "parent@example.com"}'

# With phone number
Invoke-RestMethod -Uri "http://localhost:8000/projects/parents/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"} -Body '{"name": "RocketKid99", "phone_number": "+919876543210"}'

# With both email and phone
Invoke-RestMethod -Uri "http://localhost:8000/projects/parents/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test-device-abc123"} -Body '{"name": "PixelMaster", "email": "parent2@example.com", "phone_number": "+14155551234"}'
```

> **Save the `jwt_token` from the response — you need it for comments and learn requests!**

---

## 7. Get Parent Profile

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/parents/{{PARENT_UUID}}/" -Method GET -Headers @{"Authorization"="Bearer {{JWT_TOKEN}}"}
```

---

## 8. List Comments

```powershell
# Get comments for a project
Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/?project_id=1" -Method GET

# With pagination
Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/?project_id=1&page=1&page_size=10" -Method GET
```

---

## 9. Get Comment Options (predefined, future use)

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/options/" -Method GET
```

---

## 10. Add Comment (requires JWT)

```powershell

Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/add/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer {{JWT_TOKEN}}"} -Body '{"project_id": 471, "username": "CoolCoder42", "text": "This project is so cool! I want to build something like this too!"}'

Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/add/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXJlbnRfaWQiOiJiNDQ2N2I5NC1mYmQzLTQ0N2QtYjI5YS0yNGZjMWZjMTZiODkiLCJwYXJlbnRfbmFtZSI6IkNvZGVOaW5qYTQyIiwiaWF0IjoxNzcxMDk3MzQ5LCJleHAiOjE3NzM2ODkzNDl9.UsGPfD5CNJFTfCX45OjPq-tVPbDt1pj1PsY4oe35-Gg"} -Body '{"project_id": 471, "username": "CoolCoder42", "text": "This project is so cool! I want to build something like this too!"}'
```

---

## 11. Delete Comment (requires JWT, owner only)

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/{{COMMENT_ID}}/" -Method DELETE -Headers @{"Authorization"="Bearer {{JWT_TOKEN}}"}
```

---

## 12. Learn Request — "I want to Learn this too!"

```powershell
# Without JWT (returns signup redirect)
Invoke-RestMethod -Uri "http://localhost:8000/projects/learn-request/" -Method POST -ContentType "application/json" -Body '{"project_id": 471}'

# With JWT (creates the request + confirmation)
Invoke-RestMethod -Uri "http://localhost:8000/projects/learn-request/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer {{JWT_TOKEN}}"} -Body '{"project_id": 471}'


Invoke-RestMethod -Uri "http://localhost:8000/projects/learn-request/" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXJlbnRfaWQiOiJiNDQ2N2I5NC1mYmQzLTQ0N2QtYjI5YS0yNGZjMWZjMTZiODkiLCJwYXJlbnRfbmFtZSI6IkNvZGVOaW5qYTQyIiwiaWF0IjoxNzcxMDk3MzQ5LCJleHAiOjE3NzM2ODkzNDl9.UsGPfD5CNJFTfCX45OjPq-tVPbDt1pj1PsY4oe35-Gg"} -Body '{"project_id": 471}'
```

---

## 13. Leaderboard — Top Creators (Live)

> Stats are refreshed daily via cron. Data may be up to ~24 hours old.

```powershell
# Top 20 creators (default)
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/" -Method GET

# Top 10
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/?limit=10" -Method GET

# Filter by course
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/?course_name=Game%20Development" -Method GET

# Combined: top 5 for a specific course
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/?course_name=Web%20Development&limit=5" -Method GET
```

---

## 14. Weekly Leaderboard (Frozen Snapshot)

> Generated once a week via cron. Immutable historical record.

```powershell
# Current week
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/weekly/" -Method GET

# Specific past week (use a Monday date)
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/weekly/?week_start=2026-02-16" -Method GET
```

---

## 15. Learner Stats Detail

> Individual learner stats with rank — for profile / project pages.

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/{{LEARNER_UID}}/" -Method GET
```

---

## Recommended Test Flow (Step by Step)

```
Step 1:  GET  /projects/                          -> Browse projects, pick a PROJECT_ID
Step 2:  GET  /projects/{id}/                     -> View project detail
Step 3:  GET  /projects/courses/                  -> See available course filters
Step 4:  POST /projects/reactions/                -> Add anonymous reaction (use fingerprint)
Step 5:  POST /projects/parents/                  -> Create account -> SAVE the jwt_token
Step 6:  POST /projects/reactions/                -> Add verified reaction (with JWT)
Step 7:  POST /projects/comments/add/             -> Add comment (with JWT + username)
Step 8:  GET  /projects/comments/?project_id={id} -> See your comment
Step 9:  GET  /projects/{id}/                     -> See updated counts + comments
Step 10: POST /projects/learn-request/            -> Without JWT -> get redirect URL
Step 11: POST /projects/learn-request/            -> With JWT -> get confirmation
Step 12: GET  /projects/parents/{uuid}/           -> View your profile
Step 13: GET  /projects/leaderboard/              -> See top creators leaderboard
Step 14: GET  /projects/leaderboard/weekly/        -> See this week's frozen snapshot
Step 15: GET  /projects/leaderboard/{learner_uid}/ -> Check a specific learner's stats
```

---

## Error Scenarios to Test

```powershell
# Missing fingerprint on reaction
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Body '{"project_id": 1, "reaction_type": "love"}'
# -> 400: X-Browser-Fingerprint header is required

# Invalid reaction type
Invoke-RestMethod -Uri "http://localhost:8000/projects/reactions/" -Method POST -ContentType "application/json" -Headers @{"X-Browser-Fingerprint"="test123"} -Body '{"project_id": 1, "reaction_type": "dislike"}'
# -> 400: reaction_type must be one of: love, wow, funny, inspiring, cool

# Comment without JWT
Invoke-RestMethod -Uri "http://localhost:8000/projects/comments/add/" -Method POST -ContentType "application/json" -Body '{"project_id": 471, "username": "TestKid", "text": "Hello!"}'
# -> 401: Authentication required

# Non-existent project
Invoke-RestMethod -Uri "http://localhost:8000/projects/999999/" -Method GET
# -> 404: Project not found

# Parent with no email or phone
Invoke-RestMethod -Uri "http://localhost:8000/projects/parents/" -Method POST -ContentType "application/json" -Body '{"name": "TestKid"}'
# -> 400: Either email or phone_number is required

# Non-existent learner stats
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/nonexistent-uid-123/" -Method GET
# -> 404: No stats found for this learner

# Invalid week_start format
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/weekly/?week_start=not-a-date" -Method GET
# -> 400: week_start must be YYYY-MM-DD

# Weekly leaderboard for a week with no snapshot
Invoke-RestMethod -Uri "http://localhost:8000/projects/leaderboard/weekly/?week_start=2020-01-06" -Method GET
# -> 200: { count: 0, results: [], message: "No leaderboard generated for this week yet." }
```
