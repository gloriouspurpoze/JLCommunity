# JL Community

A community showcase app for **JetLearn** student projects. Browse projects, react with emojis, comment, and discover top creators—all backed by a REST API.

---

## Features

- **Home** – Featured “Most loved” projects (reactions + comments) and an infinite-scroll grid of community projects with search
- **Project detail** – Video player (Google Drive), reactions (love, cool, inspiring, wow, funny), comments (with parent/guardian sign-up), related projects, and “I want to learn this too” requests
- **Top creators** – Leaderboard weekly top 10 list
- **Auth** – Parent/guardian contact (email or phone) stored in `localStorage`; re-auth from stored details when token expires so users don’t re-enter details
- **Skeleton loading** – Skeleton UIs site-wide; on project detail, clicking a related project shows a skeleton immediately while the new project loads
- **Custom scrollbars** – Thin, styled scrollbars for main content and Top Creators sidebar

---

## Tech stack

| Layer      | Tech |
| ---------- | -----|
| Framework  | React 19 |
| Build      | Vite 7 |
| Routing    | React Router 7 |
| Styling    | Tailwind CSS 4 |
| HTTP       | Axios |

---

## Prerequisites

- **Node.js** 18+ (or 20+ recommended)
- **npm** or **yarn**

---

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd JLCommunity
   npm install
   ```

2. **Environment**

   Copy the example env and set your API base URL:

   ```bash
   cp .env.example .env
   ```

   In `.env`:

   ```env
   # Development
   VITE_API_BASE_URL=http://localhost:8000/projects

   # Or production
   # VITE_API_BASE_URL=https://live.jetlearn.com/projects
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   App runs at **http://localhost:5173** (or the port Vite prints).

---

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start dev server (Vite)    |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |

---

## Project structure

```
src/
├── App.jsx                 # Routes: Home, Dashboard, TopCreators, ProjectDetail
├── main.jsx
├── index.css                # Global + Tailwind + custom scrollbar
├── components/              # Reusable UI
│   ├── FeaturedCard.jsx
│   ├── FeaturedProjects.jsx
│   ├── Header.jsx
│   ├── ProjectCard.jsx
│   ├── ReactionBar.jsx
│   ├── Skeleton.jsx        # Skeleton loaders
│   ├── TopCreators.jsx     # Sidebar leaderboard
│   └── ...
├── layouts/
│   ├── MainLayout.jsx      # Header + main scroll + Top Creators sidebar
│   └── BaseLayout.jsx      # Header + main scroll (e.g. project detail)
├── pages/
│   ├── Home.jsx
│   ├── ProjectDetail.jsx
│   ├── TopCreatorsPage.jsx
│   └── Dashboard.jsx
├── services/               # API and auth
│   ├── api.js              # Axios instance, interceptors
│   ├── auth.js             # JWT + parent info (localStorage)
│   ├── projects.js
│   ├── comments.js
│   ├── reactions.js
│   ├── parents.js          # Create parent, re-auth from storage
│   ├── learnRequests.js
│   ├── leaderboard.js
│   ├── fingerprint.js
│   └── errorHandler.js
└── utils/
    └── thumbnails.js       # Google Drive thumbnail/embed URLs
```

---

## API

The app expects a backend base URL such as:

- `http://localhost:8000/projects` (dev) or  
- `https://live.jetlearn.com/projects` (prod)

Key areas:

- **Projects** – List, detail, related projects; thumbnails/embeds from Google Drive URLs
- **Reactions** – Create/update/delete (with optional JWT or browser fingerprint)
- **Comments** – List, add (requires parent auth)
- **Parents** – Register (email/phone + name); JWT returned and stored; re-auth uses stored contact to get a new token
- **Learn requests** – Submit “I want to learn this too” (with parent context)
- **Leaderboard** – Top creators (weekly and all-time, top 10)

See `src/services/` and any `API_REFERENCE.md` or backend docs for full endpoint details.

---

## License

Private / internal use unless otherwise stated.
