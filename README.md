# GitHub PR Manager

A comprehensive full-stack web application for managing GitHub repositories and pull requests with OAuth authentication. This project demonstrates modern web development practices with React frontend and Node.js backend architecture.

## 🚀 Project Overview

GitHub PR Manager is a sophisticated web application that allows users to:
- **Authenticate** via GitHub OAuth for secure access
- **Browse and search** personal and organization repositories
- **View detailed repository information** including files, branches, and metadata
- **Manage pull requests** with full CRUD operations
- **Create new pull requests** with branch management
- **Comment on pull requests** and view discussion threads

## 🏗️ Architecture

### Monorepo Structure
```
GitHub-Manager/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
├── README.md        # Project documentation
└── TEST_ACCURACY.md # Test coverage report
```

### Technology Stack

**Frontend (`client/`)**
- **React 18** - Modern React with hooks and functional components
- **React Router v6** - Client-side routing with protected routes
- **React Query** - Server state management and caching
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - HTTP client for API communication
- **Framer Motion** - Animation library for smooth transitions
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library
- **Jest** - Testing framework

**Backend (`server/`)**
- **Node.js + Express** - RESTful API server
- **Passport.js** - GitHub OAuth authentication strategy
- **MongoDB + Mongoose** - Database and ODM for session storage
- **Express Session** - Session management with MongoDB store
- **Express Validator** - Input validation middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting protection
- **Jest** - testing framework

## 📁 Detailed File Structure

### Frontend (`client/`)

```
client/
├── public/
│   ├── index.html           # Main HTML template
│   ├── favicon.ico          # App icon
│   ├── manifest.json        # PWA manifest
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CreatePullRequestModal.js    # Modal for creating PRs
│   │   ├── FileViewer.js               # File content display
│   │   ├── Layout.js                   # Main app layout wrapper
│   │   ├── LoadingSpinner.js           # Loading state component
│   │   ├── Navbar.js                   # Top navigation bar
│   │   └── Sidebar.js                  # Side navigation menu
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.js              # Authentication state management
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js                  # Authentication hook
│   ├── pages/               # Route components
│   │   ├── Dashboard.js                # Main dashboard view
│   │   ├── Login.js                    # OAuth login page
│   │   ├── PullRequest.js              # Individual PR details
│   │   ├── PullRequests.js             # PR listing page
│   │   ├── Repositories.js             # Repository listing
│   │   └── Repository.js               # Individual repository view
│   ├── services/            # API service layer
│   │   ├── apiService.js               # Main API client
│   │   └── authService.js              # Authentication API calls
│   ├── utils/               # Utility functions
│   │   └── testUtils.js                # Testing utilities
│   ├── App.js               # Main app component with routing
│   ├── index.js             # App entry point
│   ├── index.css            # Global styles
│   └── setupTests.js        # Jest test configuration
├── build/                   # Production build output
├── package.json             # Frontend dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

### Backend (`server/`)

```
server/
├── config/                  # Configuration files
│   └── passport.js          # Passport GitHub OAuth strategy
├── middleware/              # Express middleware
│   └── auth.js              # Authentication middleware
├── models/                  # Database models
│   ├── Repository.js        # Repository data model
│   └── User.js              # User data model
├── routes/                  # API route handlers
│   ├── api.js               # Main API endpoints
│   └── auth.js              # Authentication routes
├── services/                # Business logic layer
│   └── githubService.js     # GitHub API integration
├── index.js                 # Server entry point
└── package.json             # Backend dependencies and scripts
```

## 🔧 Key Features & Implementation

### Authentication Flow
1. **OAuth Integration**: Users authenticate via GitHub OAuth 2.0
2. **Session Management**: Secure session storage with MongoDB
3. **Protected Routes**: Frontend route protection with authentication guards
4. **Token Management**: Automatic token refresh and validation

### Repository Management
- **Repository Listing**: Paginated repository browsing with search functionality
- **Repository Details**: Comprehensive repository information display
- **File Explorer**: Browse repository files and directories
- **Branch Management**: View and create repository branches

### Pull Request Operations
- **PR Listing**: View all pull requests with filtering options
- **PR Details**: Detailed pull request view with diff display
- **PR Creation**: Create new pull requests with branch selection
- **Comment System**: Add and view comments on pull requests
- **Status Tracking**: Real-time PR status updates

### API Architecture
- **RESTful Design**: Clean REST API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet security headers and CORS configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (cloud instance)
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GitHub-Manager
```

2. **Install dependencies**
```bash
# Frontend dependencies
cd client
npm install

# Backend dependencies
cd ../server
npm install
```

3. **Environment Configuration**

Create `server/.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
SESSION_SECRET=your_session_secret_key
MONGODB_URI=mongodb://localhost:27017/github-pr-manager
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. **GitHub OAuth Setup**
   - Create a GitHub OAuth App in your GitHub settings
   - Set Authorization callback URL to `http://localhost:5000/auth/github/callback`
   - Copy Client ID and Client Secret to your `.env` file

### Running the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

**Production Build:**
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🧪 Testing

The project includes comprehensive test coverage with 100% passing tests:

### Frontend Tests
- **Test Suites**: 16/16 passed
- **Tests**: 69/69 passed
- **Coverage**: Components, pages, services, and utilities

### Backend Tests
- **Test Suites**: 6/6 passed
- **Tests**: 44/44 passed
- **Coverage**: Routes, services, middleware, and models

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run frontend tests only
npm run test:client

# Run backend tests only
npm run test:server
```

## 📊 API Endpoints

### Authentication Routes (`/auth`)
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - OAuth callback handler
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - User logout

### API Routes (`/api`)
- `GET /api/repositories` - List user repositories (with search/pagination)
- `GET /api/repositories/:owner/:repo` - Repository details
- `GET /api/repositories/:owner/:repo/pulls` - List pull requests
- `GET /api/repositories/:owner/:repo/pulls/:number` - Pull request details
- `GET /api/repositories/:owner/:repo/pulls/:number/comments` - PR comments
- `POST /api/repositories/:owner/:repo/pulls/:number/comments` - Add comment
- `POST /api/repositories/:owner/:repo/pulls` - Create pull request
- `GET /api/repositories/:owner/:repo/branches` - List branches
- `POST /api/repositories/:owner/:repo/branches` - Create branch

## 🔒 Security Features

- **OAuth 2.0 Authentication** with GitHub
- **Session-based authentication** with secure cookies
- **Rate limiting** to prevent API abuse
- **CORS configuration** for cross-origin requests
- **Helmet security headers** for protection
- **Input validation** with express-validator
- **Error handling** without sensitive data exposure



## 📈 Performance Optimizations

- **React Query caching** for API responses
- **Code splitting** with React.lazy
- **Image optimization** and lazy loading
- **Bundle size optimization** with webpack
- **Database indexing** for MongoDB queries
- **API response caching** strategies


### Technical Highlights
- **Full-stack architecture** with modern React and Node.js
- **OAuth integration** with GitHub API
- **Comprehensive testing** with 100% test coverage
- **Security best practices** implementation
- **Responsive design** with Tailwind CSS
- **State management** with React Query and Context API
- **Error handling** and user experience optimization

### Architecture Decisions
- **Monorepo structure** for better code organization
- **Service layer pattern** for API abstraction
- **Middleware architecture** for cross-cutting concerns
- **Component-based design** for reusability
- **RESTful API design** for scalability

### Challenges Solved
- **Cross-origin authentication** with OAuth
- **Session management** across different domains
- **GitHub API rate limiting** handling
- **Real-time updates** without WebSockets
- **File content display** with syntax highlighting
- **Branch management** for PR creation

This project demonstrates proficiency in modern web development, API integration, authentication systems, and full-stack application architecture.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
