# BugLine - B2B SaaS Bug Reporting & Management Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-orange.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BugLine transforms bug reporting from a fragmented, manual process into a streamlined, intelligent ecosystem.** Our embeddable widget enables seamless bug capture directly from web applications, while our comprehensive dashboard provides complete visibility and control over the entire bug resolution lifecycle with GitHub integration and automated workflows.

## 🌟 Vision & Mission

**Vision:** Eliminate the friction between bug discovery and resolution, empowering development teams to build better software faster.

**Mission:** Provide an intelligent, automated bug tracking platform that seamlessly integrates into existing development workflows while supporting both internal teams and external users.

## 🚀 Features

### Core Platform Features
- **🎯 Embeddable Widget**: Lightweight JavaScript widget for seamless bug reporting from any web application
- **🏢 Multi-Company Architecture**: Complete multi-tenant support with company and project management
- **👥 Advanced Team Collaboration**: Role-based access control (Super Admin, Company Admin, Developer, QA, User) with invitation system
- **🤖 Intelligent Assignment**: Automated bug assignment based on severity, category, team expertise, and availability
- **📊 Comprehensive Dashboard**: Real-time bug tracking with advanced filtering, sorting, and bulk operations
- **🔗 GitHub Integration**: Bidirectional issue synchronization, PR linking, and automated status updates
- **📈 Analytics & Reporting**: Bug trends, team performance metrics, resolution time analytics, and custom reports
- **🔔 Smart Notifications**: Real-time alerts via WebSocket, email, and Slack integration
- **🎨 Customizable Widget**: Theme matching, brand colors, and custom CSS support

### Technical Excellence
- **⚡ High Performance**: Widget loads <1.5s, dashboard responds <500ms
- **🎨 Modern UI**: React 19 + Tailwind CSS 4.x with responsive design
- **🔒 Enterprise Security**: JWT authentication, encrypted data, HTTPS everywhere, SOC 2 Type II compliant
- **🌍 Scalable Architecture**: PostgreSQL database with optimized indexes and multi-region support
- **📱 Mobile Ready**: Fully responsive across all devices with PWA capabilities
- **🛡️ GDPR Compliant**: Privacy-first data handling with complete user consent management

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [System Flows](#-system-flows)
- [Getting Started](#️-getting-started)
- [Monorepo Structure](#-monorepo-structure)
- [Development Workflow](#-development-workflow)
- [API Documentation](#-api-documentation)
- [Widget Integration](#-widget-integration)
- [Database Schema](#️-database-schema)
- [Role-Based Access Control](#-role-based-access-control)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Business Model](#-business-model)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

## 🏗️ Architecture Overview

BugLine is built as a monorepo containing two main packages with advanced integrations:

```mermaid
graph TB
    subgraph "Client Applications"
        W[Web Applications with Widget]
        D[BugLine Dashboard]
        M[Mobile App - Future]
    end
    
    subgraph "BugLine Platform"
        API[Express.js API]
        DB[(PostgreSQL Database)]
        AUTH[JWT Authentication]
        WS[WebSocket Server]
    end
    
    subgraph "External Integrations"
        GH[GitHub API]
        EMAIL[Email Service]
        SLACK[Slack Integration]
        STORAGE[File Storage]
    end
    
    subgraph "Analytics & Monitoring"
        ANALYTICS[Bug Analytics Engine]
        METRICS[Performance Metrics]
        LOGS[Audit Logs]
    end
    
    W -->|Bug Reports| API
    D -->|Management| API
    API --> DB
    API --> AUTH
    API --> WS
    API --> GH
    API --> EMAIL
    API --> SLACK
    API --> STORAGE
    API --> ANALYTICS
    ANALYTICS --> METRICS
    DB --> LOGS
    
    style W fill:#e3f2fd
    style API fill:#fff3e0
    style DB fill:#f3e5f5
    style GH fill:#e8f5e8
```

### Frontend (`@bugline/client`)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x with custom theming
- **State Management**: Redux Toolkit with RTK Query
- **Build Tool**: Vite 7.x with optimizations
- **Features**: Responsive dashboard, real-time notifications, team management, analytics

### Backend (`@bugline/server`)
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 14+ with Supabase
- **Authentication**: JWT + bcrypt with refresh tokens
- **Real-time**: WebSocket for live updates
- **Features**: REST API, user management, GitHub integration, intelligent assignment

### Key Integrations
- **GitHub**: Issue synchronization, PR linking, webhook support, automated workflows
- **Supabase**: Database hosting, real-time subscriptions, authentication, file storage
- **Email**: Transactional emails, digest notifications, team invitations
- **Analytics**: Bug trends, performance metrics, custom dashboards

## 🔄 System Flows

### 1. Company Onboarding Flow

```mermaid
flowchart TD
    A[User Visits BugLine] --> B[Sign Up as Company]
    B --> C[Fill Company Details]
    C --> D[Submit for Approval]
    D --> E[Email Confirmation Sent]
    E --> F[Super Admin Review]
    F --> G{Approval Decision}
    G -->|Approved| H[Company Activated]
    G -->|Rejected| I[Rejection Email with Reason]
    H --> J[Company Admin Dashboard Access]
    J --> K[Create First Project]
    K --> L[Generate Widget Token]
    L --> M[Invite Team Members]
    M --> N[Configure Widget Settings]
    N --> O[Deploy Widget to Application]
    O --> P[Start Receiving Bug Reports]
    
    style A fill:#e1f5fe
    style H fill:#c8e6c9
    style I fill:#ffcdd2
    style P fill:#fff3e0
```

### 2. Bug Reporting & Resolution Flow

```mermaid
flowchart TD
    A[User Encounters Bug] --> B[Clicks Widget]
    B --> C[Widget Captures Context]
    C --> D{User Registered?}
    D -->|Yes| E[Auto-fill User Info]
    D -->|No| F[Enter Email & Details]
    E --> G[Fill Bug Details]
    F --> G
    G --> H[Submit Bug Report]
    H --> I[Automatic Error Capture]
    I --> J[Smart Assignment Engine]
    J --> K{Assignment Rule Match?}
    K -->|Critical| L[Auto-assign to Team Lead + GitHub Issue]
    K -->|UI/UX| M[Auto-assign to Frontend Dev]
    K -->|Backend| N[Auto-assign to Backend Dev]
    K -->|General| O[Round-robin Assignment]
    K -->|No Match| P[Assign to Company Admin]
    
    L --> Q[Developer Notification]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R[Developer Reviews Bug]
    R --> S[Update Status: In Progress]
    S --> T[Create GitHub Branch]
    T --> U[Code Fix & PR Creation]
    U --> V[Link PR to Bug]
    V --> W[Code Review Process]
    W --> X[Merge & Deploy]
    X --> Y[Auto-update Status: Resolved]
    Y --> Z[QA Verification]
    Z --> AA{Verification Passed?}
    AA -->|Yes| BB[Status: Closed]
    AA -->|No| CC[Reopen Bug]
    CC --> R
    BB --> DD[Reporter Notification]
    DD --> EE[Analytics Update]
    
    style A fill:#ffebee
    style H fill:#e8f5e8
    style BB fill:#c8e6c9
    style CC fill:#fff3e0
```

### 3. Multi-Company User Flow

```mermaid
flowchart TD
    A[User Login] --> B[Load User Companies]
    B --> C{Multiple Companies?}
    C -->|Yes| D[Display Company Selector]
    C -->|No| E[Load Single Company Dashboard]
    D --> F[User Selects Company]
    F --> G[Switch Company Context]
    G --> H[Load Company Dashboard]
    E --> H
    H --> I[Apply Role-Based Permissions]
    I --> J[Display Available Features]
    J --> K[User Performs Actions]
    K --> L{Switch Company?}
    L -->|Yes| M[Company Selector]
    L -->|No| N[Continue in Current Context]
    M --> F
    N --> O[Complete Workflow]
    
    style A fill:#e3f2fd
    style I fill:#fff3e0
    style O fill:#c8e6c9
```

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

4. **Initialize database**
   ```bash
   # Run database migrations
   npm run db:migrate --workspace=@bugline/server
   
   # Seed initial data (optional)
   npm run db:seed --workspace=@bugline/server
   ```

5. **Start both client and server**
   ```bash
   npm run dev:all
   ```

6. **Access the application**
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

# Database Operations
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed database with sample data
npm run db:reset          # Reset database (dev only)

# Code Quality
npm run lint              # Lint both packages
npm run lint:client       # Lint frontend code
npm run lint:server       # Lint backend code
npm run lint:fix          # Fix lint issues in both packages

# Testing
npm run test              # Test both packages
npm run test:client       # Test frontend components
npm run test:server       # Test backend API
npm run test:e2e          # End-to-end tests

# Utilities
npm run clean             # Clean build artifacts
npm run typecheck         # TypeScript type checking
npm run format            # Format code with Prettier
```

## 📁 Monorepo Structure

```
bugline/
├── packages/
│   ├── client/                    # Frontend React Application (@bugline/client)
│   │   ├── public/               # Static assets
│   │   ├── src/
│   │   │   ├── app/              # Redux store configuration
│   │   │   │   ├── store.js      # Redux store setup
│   │   │   │   └── api.js        # RTK Query API definitions
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── ui/          # Basic UI components
│   │   │   │   ├── forms/       # Form components
│   │   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   │   ├── analytics/   # Analytics components
│   │   │   │   └── layout/      # Layout components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── Auth/        # Authentication pages
│   │   │   │   ├── Dashboard/   # Dashboard pages
│   │   │   │   ├── Analytics/   # Analytics pages
│   │   │   │   ├── Settings/    # Settings pages
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
│       │   │   ├── database.js  # Supabase connection
│       │   │   └── github.js    # GitHub API configuration
│       │   ├── controllers/     # API route controllers
│       │   │   ├── authController.js
│       │   │   ├── userController.js
│       │   │   ├── companyController.js
│       │   │   ├── projectController.js
│       │   │   ├── bugController.js
│       │   │   └── analyticsController.js
│       │   ├── middleware/      # Express middleware
│       │   │   ├── auth.js      # JWT authentication
│       │   │   ├── rbac.js      # Role-based access control
│       │   │   ├── validation.js # Input validation
│       │   │   ├── rateLimiting.js # API rate limiting
│       │   │   └── errorHandler.js
│       │   ├── routes/          # API route definitions
│       │   │   ├── authRoutes.js
│       │   │   ├── userRoutes.js
│       │   │   ├── companyRoutes.js
│       │   │   ├── projectRoutes.js
│       │   │   ├── bugRoutes.js
│       │   │   └── analyticsRoutes.js
│       │   ├── services/        # Business logic services
│       │   │   ├── authService.js
│       │   │   ├── userService.js
│       │   │   ├── companyService.js
│       │   │   ├── bugService.js
│       │   │   ├── assignmentService.js
│       │   │   ├── githubService.js
│       │   │   └── analyticsService.js
│       │   ├── utils/           # Backend utilities
│       │   │   ├── logger.js    # Logging utility
│       │   │   ├── response.js  # API response helpers
│       │   │   ├── encryption.js # Data encryption
│       │   │   └── websocket.js # WebSocket handling
│       │   ├── tests/           # API tests
│       │   │   ├── unit/        # Unit tests
│       │   │   ├── integration/ # Integration tests
│       │   │   └── api.test.js  # API endpoint tests
│       │   └── server.js        # Express app entry point
│       ├── migrations/          # Database migration files
│       ├── seeds/              # Database seed files
│       ├── .eslintrc.json      # ESLint configuration
│       ├── .env.example        # Environment variables template
│       ├── package.json        # Server dependencies
│       └── README.md           # Server documentation
│
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── deployment/            # Deployment guides
│   ├── development/           # Development guides
│   └── assets/               # Documentation assets
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
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   EMAIL_SERVICE_API_KEY=your_email_api_key
   SLACK_BOT_TOKEN=your_slack_bot_token
   ```

3. **GitHub Integration Setup**:
   ```bash
   # Create GitHub App at https://github.com/settings/apps
   # Set webhook URL: https://your-domain.com/webhooks/github
   # Enable permissions: Issues, Pull requests, Metadata
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

- **ESLint**: Configured for both React and Node.js with custom rules
- **Prettier**: Consistent code formatting with custom configuration
- **Conventional Commits**: Standardized commit messages for automated changelog
- **TypeScript**: Gradual migration planned with strict configuration
- **Testing**: Jest for backend, Vitest for frontend, Playwright for E2E

## 📚 API Documentation

### Backend API Endpoints

```bash
# Authentication
POST /api/auth/register        # User registration
POST /api/auth/login          # User login
POST /api/auth/refresh        # Refresh JWT token
POST /api/auth/logout         # User logout
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Password reset confirmation

# Companies
GET  /api/companies           # List companies (Super Admin)
POST /api/companies           # Create company (requires approval)
GET  /api/companies/:id       # Get company details
PUT  /api/companies/:id       # Update company
POST /api/companies/:id/approve # Approve company (Super Admin)
DELETE /api/companies/:id     # Delete company (Super Admin)

# Company Users
GET  /api/companies/:id/users # List company users
POST /api/companies/:id/users # Create user (Company Admin)
PUT  /api/company-users/:id   # Update user role
DELETE /api/company-users/:id # Remove user from company
POST /api/companies/:id/invite # Invite user to company

# Projects
GET  /api/companies/:id/projects # List company projects
POST /api/companies/:id/projects # Create project
GET  /api/projects/:id        # Get project details
PUT  /api/projects/:id        # Update project
DELETE /api/projects/:id      # Delete project
POST /api/projects/:id/widget-config # Update widget configuration

# Bugs
GET  /api/projects/:id/bugs   # List project bugs (with filters)
POST /api/projects/:id/bugs   # Create bug report
GET  /api/bugs/:id            # Get bug details
PUT  /api/bugs/:id            # Update bug
DELETE /api/bugs/:id          # Delete bug
POST /api/bugs/:id/assign     # Assign bug to user
POST /api/bugs/:id/comments   # Add comment to bug
GET  /api/bugs/:id/activities # Get bug activity history

# Analytics
GET  /api/companies/:id/analytics # Company analytics
GET  /api/projects/:id/analytics  # Project analytics
GET  /api/analytics/widget       # Widget analytics
GET  /api/analytics/performance  # Performance metrics

# GitHub Integration
POST /api/github/connect      # Connect GitHub account
GET  /api/github/repos        # List user repositories
POST /api/github/webhook      # GitHub webhook endpoint
POST /api/bugs/:id/github-issue # Create GitHub issue for bug
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
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "version": "2.2"
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "req_123456789"
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
    projectToken: 'your-project-token',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    theme: 'auto', // light, dark, auto
    primaryColor: '#007bff',
    allowScreenshots: true,
    autoErrorCapture: true,
    customFields: {
      severity: ['critical', 'high', 'medium', 'low'],
      category: ['ui', 'backend', 'performance', 'security']
    },
    onBugReported: function(bug) {
      console.log('Bug reported:', bug);
      // Custom analytics tracking
      analytics.track('bug_reported', {
        bugId: bug.id,
        category: bug.category,
        severity: bug.severity
      });
    },
    onLoad: function() {
      console.log('BugLine widget loaded successfully');
    },
    onError: function(error) {
      console.error('BugLine widget error:', error);
    }
  });
</script>
```

### Advanced Widget Configuration

```javascript
BugLine.init({
  // Required
  projectToken: 'uuid-based-project-token',
  
  // Appearance & Positioning
  position: 'bottom-right',
  theme: 'auto',
  primaryColor: '#007bff',
  customCSS: '/path/to/custom-widget.css',
  
  // Security & Performance
  rateLimiting: {
    maxReports: 10,
    timeWindow: 300 // 5 minutes
  },
  domainRestrictions: ['example.com', '*.example.com'],
  
  // Feature Configuration
  allowScreenshots: true,
  enableConsoleCapture: true,
  enableNetworkCapture: false, // Pro feature
  enablePerformanceMetrics: true,
  maxScreenshotSize: 2048000, // 2MB
  
  // Custom Fields & Categories
  customFields: {
    priority: {
      type: 'select',
      options: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    browser: {
      type: 'multiselect',
      options: ['chrome', 'firefox', 'safari', 'edge']
    },
    environment: {
      type: 'text',
      placeholder: 'e.g., staging, production'
    }
  },
  
  // Localization
  language: 'en',
  customTexts: {
    reportButton: 'Report Bug',
    titlePlaceholder: 'Describe the issue...',
    submitText: 'Submit Report'
  },
  
  // Advanced Features
  offlineSupport: true,
  autoRetry: {
    enabled: true,
    maxAttempts: 3,
    delay: 1000
  },
  
  // Callback Handlers
  onLoad: () => console.log('Widget loaded'),
  onBugReported: (bug) => {
    // Custom tracking
    window.dataLayer?.push({
      event: 'bug_reported',
      bug_id: bug.id,
      bug_severity: bug.severity
    });
  },
  onError: (error) => {
    // Error monitoring
    window.Sentry?.captureException(error);
  },
  
  // Integration Hooks
  beforeSubmit: (bugData) => {
    // Add custom metadata
    bugData.customMetadata = {
      userSegment: getUserSegment(),
      featureFlags: getActiveFeatureFlags()
    };
    return bugData;
  }
});
```

### Widget Features

- **📷 Screenshot Capture**: Automatic screenshot of current page with annotation tools
- **🔍 Environment Detection**: Browser, OS, viewport size, device type auto-captured
- **🎨 Customizable Appearance**: Match your brand colors, themes, and custom CSS
- **📡 Offline Support**: Queue reports when offline, sync when connection restored
- **🔒 GDPR Compliant**: Privacy-first data collection with user consent management
- **🚀 Performance Optimized**: Lazy loading, minimal bundle size, CDN delivered
- **🌐 Multi-language Support**: Localization for 15+ languages
- **📊 Analytics Integration**: Built-in tracking for popular analytics platforms

## 🗄️ Database Schema (Simplified MVP)

### Core Tables Overview

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string global_role
        timestamp created_at
    }
    
    Company {
        uuid id PK
        string name
        string slug UK
        timestamp created_at
    }
    
    CompanyUser {
        uuid id PK
        uuid user_id FK
        uuid company_id FK
        string role
        timestamp created_at
    }
    
    Project {
        uuid id PK
        uuid company_id FK
        string name
        string slug
        timestamp created_at
    }
    
    Bug {
        uuid id PK
        uuid project_id FK
        string title
        text description
        string status
        string priority
        string reporter_email
        uuid assigned_to FK
        timestamp created_at
    }
    
    User ||--o{ CompanyUser : "belongs to"
    Company ||--o{ CompanyUser : "has members"
    Company ||--o{ Project : "owns"
    Project ||--o{ Bug : "contains"
    User ||--o{ Bug : "assigned to"
```

### Enhanced Database Schema

```sql
-- Users Table (System-wide)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  global_role VARCHAR(20) DEFAULT 'USER', -- SUPER_ADMIN, USER
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Users (Multi-tenant User-Company Relationships)
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- ADMIN, DEVELOPER, QA, OTHERS
  status VARCHAR(20) DEFAULT 'active',
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, company_id)
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  widget_token UUID UNIQUE DEFAULT gen_random_uuid(),
  widget_config JSONB DEFAULT '{}',
  github_repo VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(company_id, slug)
);

-- Bugs Table (Comprehensive Bug Tracking)
CREATE TABLE bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  category VARCHAR(50), -- ui, backend, performance, security
  reporter_email VARCHAR(255),
  reporter_user_id UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  -- Technical Context
  user_agent TEXT,
  browser_info JSONB,
  page_url VARCHAR(1000),
  console_errors JSONB,
  javascript_errors JSONB,
  custom_metadata JSONB DEFAULT '{}',
  
  -- GitHub Integration
  github_issue_number INTEGER,
  github_issue_url VARCHAR(500),
  github_pr_numbers INTEGER[],
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- Bug Comments & Communication
CREATE TABLE bug_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  comment_type VARCHAR(30) DEFAULT 'comment', -- comment, status_change, assignment
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail & Activity Tracking
CREATE TABLE bug_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- created, updated, assigned, status_changed
  field_name VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invitation System
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_bugs_project_status ON bugs(project_id, status);
CREATE INDEX idx_bugs_assigned_to ON bugs(assigned_to);
CREATE INDEX idx_bugs_created_at ON bugs(created_at DESC);
CREATE INDEX idx_company_users_lookup ON company_users(user_id, company_id);
CREATE INDEX idx_activities_bug_id ON bug_activities(bug_id);
```

## 🔐 Role-Based Access Control (RBAC)

### System Architecture

```mermaid
graph TD
    subgraph "System-Level Roles"
        SA[Super Admin]
        U[User]
    end
    
    subgraph "Company-Level Roles"
        CA[Company Admin]
        DEV[Developer]
        QA[QA Engineer]
        OTHER[Others/Viewer]
    end
    
    SA -->|Approves| COMP[Companies]
    SA -->|Monitors| PLATFORM[Platform]
    
    U -->|Belongs to| CA
    U -->|Belongs to| DEV
    U -->|Belongs to| QA
    U -->|Belongs to| OTHER
    
    CA -->|Manages| USERS[Users]
    CA -->|Creates| PROJ[Projects]
    CA -->|Oversees| BUGS[All Bugs]
    
    DEV -->|Resolves| ASSIGNED[Assigned Bugs]
    DEV -->|Updates| STATUS[Bug Status]
    
    QA -->|Reports| NEWBUGS[New Bugs]
    QA -->|Verifies| FIXES[Bug Fixes]
    
    OTHER -->|Reports| BASICBUGS[Basic Bug Reports]
    
    style SA fill:#ff6b6b
    style CA fill:#4ecdc4
    style DEV fill:#45b7d1
    style QA fill:#96ceb4
    style OTHER fill:#ffeaa7
```

### Permission Matrix

| **Action** | **Super Admin** | **Company Admin** | **Developer** | **QA Engineer** | **Others/User** |
|------------|----------------|-------------------|---------------|----------------|----------------|
| **Company Management** |
| Approve Companies | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Company | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update Company Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| **User Management** |
| Create Users | ❌ | ✅ | ❌ | ❌ | ❌ |
| Invite Team Members | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update User Roles | ❌ | ✅ | ❌ | ❌ | ❌ |
| Remove Users | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Project Management** |
| Create Projects | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update Project Settings | ❌ | ✅ | ❌ | ❌ | ❌ |
| Configure Widget | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Bug Management** |
| Create Bug Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Company Bugs | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own Bugs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign Bugs | ✅ | ✅ | ✅* | ❌ | ❌ |
| Update Bug Status | ✅ | ✅ | ✅** | ❌ | ✅*** |
| Delete Bugs | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Advanced Features** |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| GitHub Integration | ✅ | ✅ | ✅ | ❌ | ❌ |

*\* Developer can only assign bugs to themselves or team members*  
*\*\* Developer can only update status for assigned bugs (Open → In Progress)*  
*\*\*\* User can only close bugs they reported (In Progress → Closed)*

### Role Definitions

#### **Super Admin** (System-Level)
- **Scope**: Platform-wide administrative access
- **Responsibilities**: Company approval, platform monitoring, system maintenance
- **Key Features**: Company management, user oversight, system analytics
- **Limitations**: Cannot directly manage company-specific operations

#### **Company Admin** (Company-Level)
- **Scope**: Full administrative control within their company
- **Responsibilities**: Team management, project setup, resource allocation
- **Key Features**: User creation, project management, complete bug oversight
- **Limitations**: Cannot access other companies' data

#### **Developer** (Company-Level)
- **Scope**: Technical bug resolution and development workflow
- **Responsibilities**: Bug fixing, status updates, code integration
- **Key Features**: GitHub integration, technical bug details, assignment capabilities
- **Limitations**: Cannot manage users or company settings

#### **QA Engineer** (Company-Level)
- **Scope**: Quality assurance and systematic testing
- **Responsibilities**: Comprehensive bug reporting, verification, testing workflows
- **Key Features**: Advanced bug reporting, test case management, regression tracking
- **Limitations**: Cannot assign bugs or manage technical resolution

#### **Others/User** (Company-Level)
- **Scope**: Basic bug reporting and tracking
- **Responsibilities**: Casual bug discovery, basic feedback
- **Key Features**: Simple bug reporting, personal bug tracking
- **Limitations**: Very limited permissions, cannot see other users' bugs

## 🧪 Testing

### Testing Strategy

```mermaid
graph TD
    subgraph "Frontend Testing"
        UT1[Unit Tests - Vitest]
        CT1[Component Tests - React Testing Library]
        IT1[Integration Tests - MSW]
        E2E1[E2E Tests - Playwright]
    end
    
    subgraph "Backend Testing"
        UT2[Unit Tests - Jest]
        IT2[Integration Tests - Supertest]
        DB[Database Tests - Test Containers]
        API[API Contract Tests]
    end
    
    subgraph "Widget Testing"
        CROSS[Cross-browser Tests]
        PERF[Performance Tests]
        COMPAT[Compatibility Tests]
    end
    
    subgraph "System Testing"
        E2E2[End-to-End Workflows]
        LOAD[Load Testing]
        SEC[Security Testing]
    end
    
    UT1 --> CT1
    CT1 --> IT1
    IT1 --> E2E1
    
    UT2 --> IT2
    IT2 --> DB
    DB --> API
    
    E2E1 --> E2E2
    E2E2 --> LOAD
    LOAD --> SEC
```

### Frontend Testing

```bash
# Component testing with Vitest
npm run test --workspace=@bugline/client

# Component testing with coverage
npm run test:coverage --workspace=@bugline/client

# E2E testing with Playwright
npm run test:e2e --workspace=@bugline/client

# Visual regression testing
npm run test:visual --workspace=@bugline/client
```

### Backend Testing

```bash
# API testing with Jest
npm run test --workspace=@bugline/server

# Integration testing with test database
npm run test:integration --workspace=@bugline/server

# Test coverage
npm run test:coverage --workspace=@bugline/server

# Load testing
npm run test:load --workspace=@bugline/server
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage for critical business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user workflows and role-based scenarios
- **Performance Tests**: Widget load time, API response time
- **Security Tests**: Authentication, authorization, data validation

## 🚀 Deployment

### Production Architecture

```mermaid
graph TB
    subgraph "CDN & Load Balancing"
        CDN[CloudFlare CDN]
        LB[Load Balancer]
    end
    
    subgraph "Frontend"
        VERCEL[Vercel Deployment]
        STATIC[Static Assets]
    end
    
    subgraph "Backend"
        API1[API Server 1]
        API2[API Server 2]
        WS[WebSocket Server]
    end
    
    subgraph "Database & Storage"
        DB[(PostgreSQL)]
        REDIS[(Redis Cache)]
        FILES[File Storage]
    end
    
    subgraph "External Services"
        GITHUB[GitHub API]
        EMAIL[Email Service]
        MONITORING[Monitoring]
    end
    
    CDN --> VERCEL
    CDN --> LB
    LB --> API1
    LB --> API2
    LB --> WS
    
    API1 --> DB
    API2 --> DB
    API1 --> REDIS
    API2 --> REDIS
    API1 --> FILES
    API2 --> FILES
    
    API1 --> GITHUB
    API2 --> EMAIL
    API1 --> MONITORING
    
    style CDN fill:#f9f,stroke:#333,stroke-width:2px
    style DB fill:#bbf,stroke:#333,stroke-width:2px
    style MONITORING fill:#bfb,stroke:#333,stroke-width:2px
```

### Deployment Options

#### **Frontend Deployment**
```bash
# Vercel (Recommended)
npm run build --workspace=@bugline/client
vercel --prod

# Netlify Alternative
npm run build --workspace=@bugline/client
netlify deploy --prod --dir=packages/client/dist

# AWS S3 + CloudFront
npm run build --workspace=@bugline/client
aws s3 sync packages/client/dist s3://bugline-frontend
aws cloudfront create-invalidation --distribution-id E123456 --paths "/*"
```

#### **Backend Deployment**
```bash
# Railway (Recommended)
railway login
railway deploy

# Docker Deployment
docker build -t bugline-api packages/server
docker run -p 3000:3000 bugline-api

# AWS ECS
aws ecs create-service --service-name bugline-api --task-definition bugline:1
```

### Environment Variables

#### **Frontend (.env.production)**
```env
VITE_API_URL=https://api.bugline.com
VITE_WS_URL=wss://api.bugline.com
VITE_APP_NAME=BugLine
VITE_GITHUB_CLIENT_ID=github_client_id
VITE_SENTRY_DSN=sentry_dsn
VITE_ANALYTICS_ID=ga_tracking_id
VITE_ENVIRONMENT=production
```

#### **Backend (.env.production)**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/bugline_prod
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=supabase_service_key

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# GitHub Integration
GITHUB_CLIENT_ID=github_app_client_id
GITHUB_CLIENT_SECRET=github_app_secret
GITHUB_WEBHOOK_SECRET=github_webhook_secret

# Email Service
EMAIL_SERVICE_API_KEY=sendgrid_api_key
EMAIL_FROM=noreply@bugline.com

# External Services
SLACK_BOT_TOKEN=slack_bot_token
REDIS_URL=redis://redis-server:6379
FILE_STORAGE_BUCKET=bugline-uploads

# Monitoring & Analytics
SENTRY_DSN=sentry_dsn
LOG_LEVEL=info
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Performance Monitoring

```bash
# Health Check Endpoints
GET /health              # Basic health check
GET /health/detailed     # Detailed system status
GET /metrics            # Prometheus metrics

# Performance Benchmarks
- API Response Time: < 200ms (95th percentile)
- Widget Load Time: < 1.5s
- Database Query Time: < 50ms (average)
- File Upload Time: < 3s (10MB file)
```

## 📈 Business Model

### Pricing Strategy

| **Feature** | **Free** | **Pro ($29/mo)** | **Enterprise ($99/mo)** |
|-------------|----------|------------------|------------------------|
| **Usage Limits** |
| Companies | 1 | 1 | Multiple |
| Projects per Company | 2 | Unlimited | Unlimited |
| Bug Reports/month | 100 | 1,000 | Unlimited |
| Team Members | 3 | 10 | Unlimited |
| File Storage | 100MB | 1GB | 10GB |
| **Core Features** |
| Embeddable Widget | ✅ | ✅ | ✅ |
| Dashboard & Analytics | Basic | Advanced | Enterprise |
| Role-based Access | Basic | Full | Full + Custom |
| **Integrations** |
| GitHub Integration | ❌ | ✅ | ✅ |
| Slack/Teams | ❌ | ✅ | ✅ |
| Email Notifications | Basic | Advanced | Advanced |
| Webhooks API | ❌ | Limited | Unlimited |
| **Advanced Features** |
| Custom Branding | ❌ | ❌ | ✅ |
| White-label Solution | ❌ | ❌ | ✅ |
| SSO Integration | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ + SLA |
| **Security & Compliance** |
| SOC 2 Type II | ❌ | ❌ | ✅ |
| GDPR Compliance | ✅ | ✅ | ✅ |
| Data Residency | US | US | Configurable |
| Audit Logs | Basic | Advanced | Enterprise |

### Revenue Projections

```mermaid
xychart-beta
    title "Revenue Growth Projection (18 months)"
    x-axis [Q1, Q2, Q3, Q4, Q5, Q6]
    y-axis "Monthly Recurring Revenue ($K)" 0 --> 100
    line [5, 15, 35, 55, 75, 95]
```

### Target Market Segments

1. **Startups & SMBs (Free/Pro)**
   - 10-50 employees
   - Limited budget, need efficient tools
   - Focus on core features and ease of use

2. **Mid-Market Companies (Pro/Enterprise)**
   - 50-500 employees
   - Multiple development teams
   - Need advanced integrations and analytics

3. **Enterprise Organizations (Enterprise)**
   - 500+ employees
   - Complex security and compliance requirements
   - Need customization and white-label solutions

## 🎯 Roadmap

### **Phase 1: MVP Foundation (Q1 2025)** ✅
- ✅ User authentication and multi-company support
- ✅ Basic bug reporting and dashboard
- ✅ Role-based access control (RBAC)
- ✅ Embeddable widget (basic version)
- 🔄 GitHub integration (basic)
- 🔄 Email notifications

### **Phase 2: Enhanced Features (Q2 2025)**
- 📋 Advanced widget customization and theming
- 📋 Real-time WebSocket updates
- 📋 File upload support (screenshots, videos)
- 📋 GitHub bidirectional sync with PR linking
- 📋 Advanced analytics dashboard
- 📋 Slack/Teams integration
- 📋 Mobile-responsive improvements

### **Phase 3: Intelligence & Automation (Q3 2025)**
- 📋 AI-powered bug categorization and assignment
- 📋 Predictive analytics and insights
- 📋 Advanced workflow automation
- 📋 Custom reporting engine
- 📋 Performance monitoring and SLA tracking
- 📋 Multi-language widget support
- 📋 Advanced search and filtering

### **Phase 4: Enterprise & Scale (Q4 2025)**
- 📋 SSO integration (SAML, OAuth, Active Directory)
- 📋 White-label solutions with custom domains
- 📋 Advanced security features and compliance
- 📋 Multi-region deployment options
- 📋 Enterprise API with webhooks
- 📋 Advanced audit trails and compliance reporting
- 📋 Custom role creation and permissions

### **Phase 5: Platform & Ecosystem (Q1 2026)**
- 📋 Mobile applications (iOS/Android)
- 📋 Third-party integration marketplace
- 📋 Advanced video calling for bug discussions
- 📋 AI-powered root cause analysis
- 📋 Advanced workflow builder
- 📋 Public API for developers
- 📋 Community features and forums

## 🛡️ Security & Privacy

### Security Measures

```mermaid
graph TD
    subgraph "Application Security"
        AUTH[JWT Authentication]
        RBAC[Role-Based Access Control]
        VALID[Input Validation]
        CSRF[CSRF Protection]
    end
    
    subgraph "Data Security"
        ENCRYPT[Data Encryption at Rest]
        TLS[TLS 1.3 in Transit]
        HASH[Password Hashing]
        BACKUP[Encrypted Backups]
    end
    
    subgraph "Infrastructure Security"
        WAF[Web Application Firewall]
        DDOS[DDoS Protection]
        MONITOR[Security Monitoring]
        PATCH[Regular Updates]
    end
    
    subgraph "Compliance"
        GDPR[GDPR Compliance]
        SOC2[SOC 2 Type II]
        AUDIT[Audit Logs]
        PRIVACY[Privacy Controls]
    end
    
    AUTH --> RBAC
    RBAC --> VALID
    ENCRYPT --> TLS
    TLS --> HASH
    WAF --> DDOS
    DDOS --> MONITOR
    GDPR --> SOC2
    SOC2 --> AUDIT
```

### Privacy Features

- **🔒 Data Minimization**: Collect only necessary information
- **🗑️ Right to Deletion**: Complete data removal on request
- **📊 Data Portability**: Export user data in standard formats
- **📋 Consent Management**: Clear, granular consent controls
- **📍 Data Residency**: EU data stays in EU (Enterprise tier)
- **🔍 Transparency**: Clear privacy policy and data usage

### Compliance Certifications

- **SOC 2 Type II**: Security, availability, and confidentiality
- **GDPR**: European data protection regulation
- **CCPA**: California Consumer Privacy Act
- **ISO 27001**: Information security management (planned)

## 🤝 Contributing

### Development Workflow

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/your-username/bugline.git
   cd bugline
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Set up development environment**
   ```bash
   cp packages/server/.env.example packages/server/.env
   # Edit .env with your local configuration
   ```
6. **Make your changes** following our coding standards
7. **Write tests** for new functionality
8. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```
9. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add intelligent bug assignment algorithm"
   ```
10. **Push and create pull request**
    ```bash
    git push origin feature/awesome-new-feature
    ```

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/) for automated changelog generation:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring without feature changes
- `perf:` Performance improvements
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes
- `ci:` CI/CD pipeline changes

### Pull Request Guidelines

- **Clear description**: Explain what changes were made and why
- **Link issues**: Reference related GitHub issues with "Fixes #123"
- **Add tests**: Include unit/integration tests for new functionality
- **Update docs**: Update README, API docs, or other documentation as needed
- **Keep focused**: One feature/fix per PR for easier review
- **Pass all checks**: Ensure CI/CD pipeline passes completely

### Code Review Process

1. **Automated checks**: All tests and linting must pass
2. **Peer review**: At least one team member must approve
3. **Security review**: For changes affecting authentication or data handling
4. **Performance review**: For changes affecting critical paths
5. **Final approval**: Maintainer approval required for merge

## 📞 Support & Community

### Getting Help

- **📚 Documentation**: Comprehensive guides at [docs.bugline.com](https://docs.bugline.com)
- **💬 Discord Community**: Join our [Discord server](https://discord.gg/bugline) for real-time help
- **🐛 Bug Reports**: Use [GitHub Issues](https://github.com/vinay8962/bugline/issues) for bugs
- **✨ Feature Requests**: Submit via [GitHub Discussions](https://github.com/vinay8962/bugline/discussions)
- **📧 Email Support**: 
  - General: support@bugline.com
  - Enterprise: enterprise@bugline.com
  - Security: security@bugline.com

### Community Guidelines

- **Be respectful**: Treat all community members with respect
- **Stay on topic**: Keep discussions relevant to BugLine
- **Help others**: Share knowledge and assist fellow developers
- **Follow code of conduct**: Maintain a welcoming environment for all

### Status & Monitoring

- **System Status**: [status.bugline.com](https://status.bugline.com)
- **API Status**: [api-status.bugline.com](https://api-status.bugline.com)
- **Incident Reports**: Transparent incident communication
- **Maintenance Windows**: Scheduled maintenance notifications

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- **React**: MIT License
- **Express.js**: MIT License
- **PostgreSQL**: PostgreSQL License
- **Tailwind CSS**: MIT License
- **All dependencies**: See individual package.json files

## 🙏 Acknowledgments

- **React Team**: For the amazing frontend framework that powers our UI
- **Supabase**: For the excellent backend-as-a-service platform
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the lightning-fast build tool and development experience
- **Open Source Community**: For countless libraries, tools, and inspiration
- **Our Beta Users**: For valuable feedback and feature suggestions
- **Contributors**: Everyone who has contributed code, documentation, or ideas

---

<div align="center">

**BugLine** - *Transforming bug tracking for modern development teams*

*Built with ❤️ by the BugLine team*

**🚀 [Try BugLine](https://bugline.com)** • **📖 [Documentation](https://docs.bugline.com)** • **💬 [Discord Community](https://discord.gg/bugline)** • **🐛 [Report Issues](https://github.com/vinay8962/bugline/issues)**

[![Star on GitHub](https://img.shields.io/github/stars/vinay8962/bugline.svg?style=social)](https://github.com/vinay8962/bugline)
[![Follow on Twitter](https://img.shields.io/twitter/follow/buglineapp.svg?style=social)](https://twitter.com/buglineapp)
[![Join Discord](https://img.shields.io/discord/123456789.svg?label=Discord&logo=discord)](https://discord.gg/bugline)

</div># Test
