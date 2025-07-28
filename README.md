# BugLine - B2B SaaS Bug Reporting & Management Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-orange.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

BugLine is a comprehensive B2B SaaS bug reporting and tracking platform that enables companies to seamlessly collect, manage, and resolve bugs from their applications through an embeddable widget, while providing complete visibility and control over the bug resolution lifecycle with GitHub integration.

## 🚀 Features

### Core Platform Features
- **🎯 Embeddable Widget**: Lightweight JavaScript widget for seamless bug reporting from any web application
- **🏢 Multi-Company Architecture**: Complete multi-tenant support with company and project management
- **👥 Team Collaboration**: Role-based access control (Admin, Developer, QA, Viewer) with team invitation system
- **🔧 Intelligent Assignment**: Automated bug assignment based on severity, category, and team availability
- **📊 Comprehensive Dashboard**: Real-time bug tracking with advanced filtering, sorting, and bulk operations
- **🔗 GitHub Integration**: Seamless issue synchronization, PR linking, and status updates
- **📈 Analytics & Reporting**: Bug trends, team performance metrics, and resolution time analytics
- **🔔 Smart Notifications**: Real-time alerts for bug assignments, updates, and status changes

### Technical Excellence
- **⚡ High Performance**: Widget loads <2s, dashboard responds <500ms
- **🎨 Modern UI**: React 19 + Tailwind CSS with responsive design
- **🔒 Enterprise Security**: JWT authentication, encrypted data, HTTPS everywhere
- **🌍 Scalable Architecture**: PostgreSQL database with optimized indexes
- **📱 Mobile Ready**: Fully responsive across all devices
- **🛡️ GDPR Compliant**: Privacy-first data handling and user consent management

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Monorepo Structure](#monorepo-structure)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Widget Integration](#widget-integration)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🏗️ Architecture Overview

BugLine is built as a monorepo containing two main packages:

### Frontend (`@bugline/client`)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x
- **State Management**: Redux Toolkit
- **Build Tool**: Vite 7.x
- **Features**: Responsive dashboard, real-time notifications, team management

### Backend (`@bugline/server`)
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 14+ with Supabase
- **Authentication**: JWT + bcrypt
- **Features**: REST API, user management, GitHub integration, bug tracking

### Key Integrations
- **GitHub**: Issue synchronization, PR linking, webhook support
- **Supabase**: Database hosting, real-time subscriptions, authentication
- **File Storage**: Screenshot and attachment handling
- **Email**: Notifications and team invitations

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher) 
- **PostgreSQL** (v14 or higher) or **Supabase account**
- **Git**
- **GitHub account** (for issue integration)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinay8962/bugline.git
   cd bugline
   ```

2. **Install all dependencies** (monorepo-wide)
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp packages/server/env.example packages/server/.env
   # Edit packages/server/.env with your database credentials
   ```

4. **Start both client and server**
   ```bash
   npm run dev:all
   ```

5. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **API Docs**: http://localhost:3000/api/docs

### Available Scripts

```bash
# Development - Run both packages
npm run dev:all           # Start both client and server
npm run start:all         # Start both in production mode

# Development - Individual packages
npm run dev:client        # Start frontend only (port 5173)
npm run dev:server        # Start backend only (port 3000)
npm run dev               # Start client (default)

# Building
npm run build:all         # Build both packages
npm run build:client      # Build frontend for production
npm run build:server      # Build backend for production
npm run build             # Build client (default)

# Code Quality
npm run lint              # Lint both packages
npm run lint:client       # Lint frontend code
npm run lint:server       # Lint backend code
npm run lint:fix          # Fix lint issues in both packages

# Testing
npm run test              # Test both packages
npm run test:client       # Test frontend components
npm run test:server       # Test backend API

# Utilities
npm run clean             # Clean build artifacts
npm run typecheck         # TypeScript type checking
```

## 📁 Monorepo Structure

```
bugline/
├── packages/
│   ├── client/                    # Frontend React Application (@bugline/client)
│   │   ├── public/               # Static assets
│   │   ├── src/
│   │   │   ├── app/              # Redux store configuration
│   │   │   │   └── store.js      # Redux store setup
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── ui/          # Basic UI components
│   │   │   │   ├── forms/       # Form components
│   │   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   │   └── layout/      # Layout components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── Auth/        # Authentication pages
│   │   │   │   ├── Dashboard/   # Dashboard pages
│   │   │   │   ├── Employee/    # Employee management
│   │   │   │   └── Home.jsx     # Landing page
│   │   │   ├── services/        # API client services
│   │   │   ├── utils/           # Frontend utility functions
│   │   │   ├── assets/          # Images and static files
│   │   │   ├── App.jsx          # Main app component
│   │   │   ├── main.jsx         # App entry point
│   │   │   └── index.css        # Global styles
│   │   ├── eslint.config.js     # ESLint configuration
│   │   ├── vite.config.js       # Vite configuration
│   │   └── package.json         # Client dependencies
│   │
│   └── server/                   # Backend Node.js API (@bugline/server)
│       ├── src/
│       │   ├── config/          # Database and app configuration
│       │   │   └── database.js  # Supabase connection
│       │   ├── controllers/     # API route controllers
│       │   │   ├── userController.js
│       │   │   ├── companyController.js
│       │   │   └── membershipController.js
│       │   ├── middleware/      # Express middleware
│       │   │   ├── auth.js      # JWT authentication
│       │   │   ├── validation.js # Input validation
│       │   │   └── errorHandler.js
│       │   ├── routes/          # API route definitions
│       │   │   ├── userRoutes.js
│       │   │   ├── companyRoutes.js
│       │   │   └── membershipRoutes.js
│       │   ├── services/        # Business logic services
│       │   │   ├── userService.js
│       │   │   ├── companyService.js
│       │   │   └── membershipService.js
│       │   ├── utils/           # Backend utilities
│       │   │   ├── logger.js    # Logging utility
│       │   │   └── response.js  # API response helpers
│       │   ├── tests/           # API tests
│       │   │   └── api.test.js
│       │   └── server.js        # Express app entry point
│       ├── .eslintrc.json      # ESLint configuration
│       ├── .env.example        # Environment variables template
│       ├── package.json        # Server dependencies
│       └── README.md           # Server documentation
│
├── node_modules/               # Shared dependencies
├── package.json               # Monorepo root configuration
├── package-lock.json          # Dependency lock file
├── PRD.md                     # Product Requirements Document
├── COMPREHENSIVE_REVIEW_REPORT.md # Project review
└── README.md                  # This file
```

## 🧪 Development Workflow

### Environment Setup

1. **Database Setup** (choose one):
   ```bash
   # Option 1: Local PostgreSQL
   createdb bugline_dev
   
   # Option 2: Supabase (recommended)
   # Sign up at https://supabase.com
   # Create a new project and copy credentials to .env
   ```

2. **Environment Configuration**:
   ```bash
   # Backend (.env)
   DATABASE_URL=postgresql://user:password@localhost:5432/bugline_dev
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### Monorepo Commands

```bash
# Work with specific workspace
npm run dev --workspace=@bugline/client
npm run build --workspace=@bugline/server
npm install axios --workspace=@bugline/client

# Add dependencies to specific packages
npm install --workspace=@bugline/server express
npm install --workspace=@bugline/client react-query
```

### Code Standards

- **ESLint**: Configured for both React and Node.js
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages
- **TypeScript**: Gradual migration planned
- **Testing**: Jest for backend, Vitest for frontend

## 📚 API Documentation

### Backend API Endpoints

```bash
# Authentication
POST /api/auth/register        # User registration
POST /api/auth/login          # User login
POST /api/auth/refresh        # Refresh JWT token

# Companies
GET  /api/companies           # List companies
POST /api/companies           # Create company
GET  /api/companies/:id       # Get company details
PUT  /api/companies/:id       # Update company

# Projects
GET  /api/projects            # List projects
POST /api/projects            # Create project
GET  /api/projects/:id        # Get project details
PUT  /api/projects/:id        # Update project

# Bugs
GET  /api/bugs                # List bugs (with filters)
POST /api/bugs                # Create bug report
GET  /api/bugs/:id            # Get bug details
PUT  /api/bugs/:id            # Update bug
DELETE /api/bugs/:id          # Delete bug

# Team Management
GET  /api/memberships         # List team members
POST /api/memberships/invite  # Invite team member
PUT  /api/memberships/:id     # Update member role
```

### API Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 🎯 Widget Integration

### Embeddable Widget Usage

Integrate BugLine's bug reporting widget into any web application:

```html
<!-- Add to your HTML head -->
<script src="https://widget.bugline.com/v1/widget.js"></script>
<script>
  BugLine.init({
    projectId: 'your-project-id',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    theme: 'auto', // light, dark, auto
    allowScreenshots: true,
    customFields: {
      severity: ['critical', 'high', 'medium', 'low'],
      category: ['ui', 'backend', 'performance', 'security']
    },
    onBugReported: function(bug) {
      console.log('Bug reported:', bug);
    }
  });
</script>
```

### Widget Features

- **📷 Screenshot Capture**: Automatic screenshot of current page
- **🔍 Environment Detection**: Browser, OS, viewport size auto-captured
- **🎨 Customizable Appearance**: Match your brand colors and themes
- **📡 Offline Support**: Queue reports when offline, sync when online
- **🔒 GDPR Compliant**: Privacy-first data collection

### Widget Configuration Options

```javascript
BugLine.init({
  // Required
  projectId: 'uuid-of-your-project',
  
  // Appearance
  position: 'bottom-right',
  theme: 'auto',
  primaryColor: '#007bff',
  
  // Features
  allowScreenshots: true,
  enableConsoleCapture: true,
  enableNetworkCapture: false,
  
  // Custom fields
  customFields: {
    priority: ['critical', 'high', 'medium', 'low'],
    browser: ['chrome', 'firefox', 'safari', 'edge'],
    device: ['desktop', 'mobile', 'tablet']
  },
  
  // Callbacks
  onLoad: () => console.log('Widget loaded'),
  onBugReported: (bug) => console.log('Bug reported', bug),
  onError: (error) => console.error('Widget error', error)
});
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Users with enhanced profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    github_username VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    skills TEXT[],
    notification_preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    github_org_name VARCHAR(100),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-company relationships with roles
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    role VARCHAR(50) NOT NULL, -- admin, developer, qa, viewer
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects within companies
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    github_repo_url VARCHAR(500),
    widget_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bug reports with comprehensive metadata
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, fixed, closed
    assigned_to UUID REFERENCES users(id),
    reporter_email VARCHAR(255),
    user_agent TEXT,
    browser_info JSONB,
    page_url VARCHAR(1000),
    screenshots TEXT[],
    github_issue_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Relationships

- **Users** belong to multiple **Companies** via **Memberships**
- **Companies** contain multiple **Projects**
- **Projects** contain multiple **Bugs**
- **Bugs** can be assigned to **Users** and linked to **GitHub Issues**

## 🚀 Deployment

### Production Deployment

```bash
# Build both packages
npm run build:all

# Deploy frontend (Vercel/Netlify)
cd packages/client && npm run build

# Deploy backend (Railway/Heroku)
cd packages/server && npm start
```

### Environment Variables

**Frontend (.env)**:
```env
VITE_API_URL=https://api.bugline.com
VITE_APP_NAME=BugLine
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
GITHUB_CLIENT_ID=your_github_app_client_id
GITHUB_CLIENT_SECRET=your_github_app_secret
NODE_ENV=production
PORT=3000
```

### Deployment Platforms

**Frontend:**
- **Vercel** (Recommended): Automatic deployments from Git
- **Netlify**: Great for static sites with serverless functions
- **AWS S3 + CloudFront**: Enterprise-grade CDN

**Backend:**
- **Railway** (Recommended): Easy Node.js deployment
- **Heroku**: Traditional PaaS with PostgreSQL add-ons
- **AWS ECS**: Containerized deployment for scale
- **DigitalOcean App Platform**: Simple container deployment

## 🧪 Testing

### Frontend Testing

```bash
# Component testing with Vitest
npm run test --workspace=@bugline/client

# E2E testing with Playwright (planned)
npm run test:e2e --workspace=@bugline/client
```

### Backend Testing

```bash
# API testing with Jest
npm run test --workspace=@bugline/server

# Test coverage
npm run test:coverage --workspace=@bugline/server
```

### Testing Strategy

- **Unit Tests**: Component logic and API endpoints
- **Integration Tests**: Full user workflows
- **E2E Tests**: Critical business scenarios
- **API Tests**: All endpoint functionality
- **Widget Tests**: Cross-browser compatibility

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/bugline.git
   cd bugline
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Make your changes**
6. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```
7. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add bug assignment automation"
   ```
8. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process changes

### Pull Request Guidelines

- Include clear description of changes
- Add tests for new functionality
- Update documentation if needed
- Ensure all checks pass
- Keep PRs focused and atomic

## 📈 Business Model

### Pricing Tiers

| Feature | Free | Pro ($29/mo) | Enterprise ($99/mo) |
|---------|------|--------------|--------------------|
| Companies | 1 | 1 | Multiple |
| Projects | 2 | Unlimited | Unlimited |
| Bug Reports/month | 100 | 1,000 | Unlimited |
| Team Members | 3 | 10 | Unlimited |
| GitHub Integration | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |
| SSO Integration | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

## 🛡️ Security & Privacy

### Security Measures

- **🔐 JWT Authentication**: Secure token-based authentication
- **🛡️ Input Validation**: Comprehensive server-side validation
- **🔒 Data Encryption**: Encrypted sensitive data storage
- **🌐 HTTPS Everywhere**: SSL/TLS encryption for all connections
- **⚡ Rate Limiting**: API protection against abuse
- **🔍 Security Headers**: CSP, HSTS, and other security headers

### GDPR Compliance

- **📋 Data Consent**: Clear consent management
- **🗑️ Right to Deletion**: Complete data removal on request
- **📊 Data Portability**: Export user data in standard formats
- **🔒 Data Minimization**: Collect only necessary information
- **📍 Data Residency**: EU data stays in EU (enterprise tier)

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ User authentication and company management
- ✅ Basic bug reporting and dashboard
- ✅ Team collaboration features
- 🔄 Embeddable widget development
- 🔄 GitHub integration

### Phase 2: Enhanced Features (Q2 2025)
- 📧 Email notifications and digests
- 📊 Advanced analytics dashboard
- 🤖 AI-powered bug categorization
- 📱 Mobile app (React Native)
- 🔗 Slack/Teams integrations

### Phase 3: Enterprise (Q3 2025)
- 🏢 SSO integration (SAML, OAuth)
- 🎨 White-label solutions
- 📡 Webhook API
- 📈 Advanced reporting
- 🌍 Multi-region deployment

## 📞 Support

### Getting Help

- **📚 Documentation**: Comprehensive guides at [docs.bugline.com](https://docs.bugline.com)
- **💬 Community**: Join our [Discord server](https://discord.gg/bugline)
- **🐛 Bug Reports**: Use GitHub Issues for bugs
- **✨ Feature Requests**: Submit via GitHub Discussions
- **📧 Email Support**: support@bugline.com (Pro/Enterprise)

### Status Page

Monitor system status at [status.bugline.com](https://status.bugline.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing frontend framework
- **Supabase**: For the excellent backend-as-a-service
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the lightning-fast build tool
- **Open Source Community**: For countless libraries and tools

---

**BugLine** - Streamlining bug tracking for modern development teams.

*Built with ❤️ by the BugLine team*

**🚀 [Try BugLine](https://bugline.com) | 📖 [Documentation](https://docs.bugline.com) | 💬 [Community](https://discord.gg/bugline)**

