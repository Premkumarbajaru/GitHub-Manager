# GitHub PR Manager

A full-stack application to browse GitHub repositories, view pull requests, and comment on PRs using GitHub OAuth.

## Monorepo Layout

- `client/`: React frontend (Create React App, React Router, React Query, Tailwind)
- `server/`: Node.js/Express backend (Passport GitHub OAuth, Express Validator, Axios)

## Tech Stack

- Frontend: React 18, React Router v6, React Query, Tailwind CSS, Axios, Jest + React Testing Library
- Backend: Node.js, Express, Passport (GitHub Strategy), Axios, express-validator, Jest + Supertest

## Architecture

### Frontend (`client/`)
- `src/components/`: Reusable UI components (Navbar, Sidebar, FileViewer, etc.)
- `src/pages/`: Feature screens (Dashboard, Repositories, PullRequests, PullRequest)
- `src/services/`: API clients (`apiService`, `authService`)
- `src/contexts/`: `AuthContext` for authenticated user/session
- `src/hooks/`: `useAuth` for auth accessors
- Data fetching with React Query; navigation with React Router v6; styling with Tailwind

Key flows:
- Login page triggers backend OAuth; session stored via cookies
- Repositories page lists and filters repos; Pull Requests pages aggregate PRs
- Pull Request page shows details and allows posting a comment

### Backend (`server/`)
- `routes/`: REST endpoints in `routes/api.js` and `routes/auth.js`
- `services/`: GitHub API orchestration in `services/githubService.js`
- `middleware/`: `auth.js` authentication guards
- `config/`: `passport.js` GitHub OAuth strategy wiring

Key endpoints (prefixed with `/api`):
- `GET /api/repositories` – list user repositories (search/pagination)
- `GET /api/repositories/:owner/:repo` – repository details
- `GET /api/repositories/:owner/:repo/pulls` – list PRs
- `GET /api/repositories/:owner/:repo/pulls/:number` – PR details
- `GET /api/repositories/:owner/:repo/pulls/:number/comments` – PR comments
- `POST /api/repositories/:owner/:repo/pulls/:number/comments` – add comment

Auth endpoints:
- `GET /auth/github` – start GitHub OAuth
- `GET /auth/github/callback` – OAuth callback
- `GET /auth/status` – check authentication
- `POST /auth/logout` – logout

## Setup

1) Install dependencies per package:
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

2) Create environment files

Backend `server/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
SESSION_SECRET=your_session_secret
MONGODB_URI=mongodb://localhost:27017/github-pr-manager
PORT=5000
NODE_ENV=development
```

Frontend `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Run

In two terminals:
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm start
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

## Testing

See `TEST_ACCURACY.md` for current status (100% passing). To reproduce locally:
```bash
# Frontend tests
cd client
npm test
npm run test:coverage

# Backend tests
cd ../server
npm test
npm run test:coverage
```

Coverage HTML reports are generated under `client/coverage/` and `server/coverage/` when using coverage scripts.

## Notes

- The application communicates with GitHub via the backend using the authenticated user’s access token
- All external calls are mocked in tests; no live GitHub calls are required during testing
- Error handling and validation are implemented both in the service layer and at route level

## License

MIT
