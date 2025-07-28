BugLine - Complete Product Requirements Document (PRD) v2.0
📋 Executive Summary
Product Name: BugLine
Product Type: B2B SaaS Bug Reporting & Management Platform
Version: 1.0 (MVP)
Target Market: Companies and Individual Developers
Launch Timeline: Q2 2025
Vision Statement
BugLine is a comprehensive bug reporting and tracking SaaS platform that enables companies to seamlessly collect, manage, and resolve bugs from their applications through an embeddable widget, while providing complete visibility and control over the bug resolution lifecycle.
Problem Statement

Companies struggle with fragmented bug reporting processes
Users often can't easily report bugs from within applications
Development teams lack centralized bug management with proper assignment workflows
No clear visibility into bug resolution progress
Manual bug triaging and assignment creates bottlenecks
External users (customers/testers) cannot easily report bugs or track their status

Solution Overview
BugLine provides an embeddable JavaScript widget that allows end-users to report bugs directly from any web application, with a powerful dashboard for companies to manage, assign, and track bug resolution with intelligent assignment workflows.

🎯 Product Goals & Objectives
Primary Goals

Streamline Bug Reporting: Enable one-click bug reporting from any web application with automatic error capture
Centralize Bug Management: Provide a unified dashboard for all company bug tracking
Automate Assignment Workflows: Intelligent bug assignment based on severity and team structure
Enhance Visibility: Complete bug lifecycle tracking with clear status workflows
Multi-User Support: Handle both internal team members and external users seamlessly
Scale Efficiently: Multi-company, multi-project architecture supporting growth

Success Metrics (KPIs)

Adoption: 100+ companies onboarded in first 6 months
Engagement: 80% monthly active usage rate
Efficiency: 50% reduction in bug resolution time
Coverage: Support both internal teams and external user bug reporting
Retention: 85% annual retention rate


👥 Target Audience & User Personas
Primary Personas
1. Super Admin

Role: Platform administrator
Goals: Approve new companies, oversee platform usage
Pain Points: Need to validate legitimate companies vs spam
Use Cases: Company approval, platform monitoring, user support

2. Company Admin/Owner

Role: CEO, CTO, Product Manager
Goals: Oversee bug management, team performance, user management
Pain Points: Manual user creation, lack of visibility, scattered tools
Use Cases: Company setup, user account creation, team management, reporting dashboard

3. Development Team Lead

Role: Engineering Manager, Senior Developer
Goals: Efficient bug assignment, team workload management
Pain Points: Manual triaging, unclear priorities, poor communication
Use Cases: Bug assignment, priority management, team performance tracking

4. Developer/QA Engineer

Role: Software Developer, QA Engineer, DevOps
Goals: Clear bug descriptions, proper assignments, efficient resolution
Pain Points: Unclear bug reports, missing context, manual status updates
Use Cases: Bug resolution, status updates, technical investigation

5. Reporter (Internal QA/Testers)

Role: Dedicated QA Engineer, Professional Tester
Goals: Systematic bug discovery, comprehensive reporting
Pain Points: Complex reporting tools, poor bug tracking
Use Cases: Structured bug reporting, regression testing, status tracking

6. User (General Product Users)

Role: End customers, casual testers, product users
Goals: Report occasional bugs they encounter, get feedback on resolution
Pain Points: Complex reporting processes, no visibility into fixes
Use Cases: Casual bug reporting via widget, basic status tracking


🚀 Feature Specifications
Core Features (MVP - V1.0)
1. User Authentication & Registration
Description: Secure user registration and authentication system with admin-controlled access

Super-admin registration and company approval system
Company admin controlled user creation (no self-registration)
Role-based access control (Super Admin, Company Admin, Developer, Reporter, User)
Profile management with enhanced details

User Creation Workflow:

Super-admin approves new companies
Company admin creates accounts for team members
Bug reports from non-existing emails are flagged for admin review
Admin can create accounts for external users post-bug submission

Acceptance Criteria:

Super-admin can approve/reject company registrations
Company admins can create user accounts with role assignment
Profile includes: name, role, skills, contact info, timezone
Email verification required for all accounts

2. Company & Project Management
Description: Multi-tenant architecture supporting multiple companies and projects with approval workflows

Company registration with super-admin approval
Project creation within companies
User account management by company admins
Project-specific settings and configurations
Multi-company user support (users can belong to multiple companies with different roles)

Acceptance Criteria:

Company registration goes to "pending" status until super-admin approval
Company admins can create multiple projects
Unique widget script generation per project with domain restrictions
Users can have different roles across different companies
Company switching interface for multi-company users

3. Embeddable Bug Reporting Widget
Description: JavaScript widget for seamless bug reporting with automatic error detection

Lightweight, embeddable script with project-specific tokens
Automatic JavaScript error capture (stack traces, file names, line numbers)
Console error detection and logging
Automatic environment detection (browser, OS, viewport)
Domain restrictions per project token

Technical Specifications:
javascript// Widget Integration
<script src="https://widget.bugline.com/v1/widget.js"></script>
<script>
  BugLine.init({
    projectToken: 'uuid-based-project-token',
    domainRestrictions: ['example.com', 'app.example.com'],
    autoErrorCapture: true,
    consoleErrorCapture: true
  });
</script>
Bug Reporting Flow:

User encounters bug and clicks widget
Widget captures: page URL, user agent, viewport, console errors, stack traces
User provides: email, bug description, steps to reproduce
System checks if email exists in company user database
If exists: Create bug linked to user
If doesn't exist: Create bug as "unassigned" and notify company admin

Acceptance Criteria:

Widget loads in <2 seconds
Works across all modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
Automatic error capture with detailed metadata
Domain restriction enforcement
Mobile responsive design

4. Bug Management Dashboard
Description: Comprehensive dashboard for bug tracking and management with company switching

Multi-company dashboard with company selector
Real-time bug list with filtering and sorting (V2.0 feature - V1.0 uses standard refresh)
Bug details view with all metadata and captured errors
Strict status management (Open → In Progress → Closed)
Priority and severity assignment
Comment system for team communication

Company Navigation:

Users see all their companies on login
Separate dashboards per company
Company → Projects → Bugs/Users hierarchy

Features Include:

Advanced filtering (status, priority, assignee, date range, reporter type)
Bulk operations (assign, update status, priority)
Search functionality across bug titles and descriptions
Automatic error log display with stack traces
Export capabilities (CSV, PDF) - Future version

5. Intelligent Assignment System
Description: Rule-based bug assignment with priority handling

UI-focused assignment with GitHub task creation for senior developer requirements
Manual assignment override by team leads
Load balancing across team members
Assignment notifications (Future version)

Assignment Rules:

Critical bugs → Team Lead + create GitHub issue for senior developer
UI/UX bugs → Frontend developers (priority)
Backend bugs → Backend developers
General bugs → Round-robin assignment based on availability
Unassigned bugs (from non-existing emails) → Company admin review

Status Transition Rules:

Open → In Progress: Only assigned developer
In Progress → Closed: Only original bug reporter
Company admin can override any status change

6. User Role Management
Description: Comprehensive role-based access control with clear permissions
Role Definitions:

Super Admin: Platform-wide company approval, system oversight
Company Admin: User creation, project management, bug oversight, status override
Developer: Bug assignment acceptance, status updates (Open → In Progress)
Reporter: Dedicated QA role, systematic bug reporting, status tracking
User: General product users, casual bug reporting, can close their own bugs

Permission Matrix:
Action                  | Super | Company | Developer | Reporter | User
                       | Admin | Admin   |          |          |
-----------------------------------------------------------------
Approve Companies      |   ✓   |         |          |          |
Create Users           |       |    ✓    |          |          |
Create Projects        |       |    ✓    |          |          |
Assign Bugs            |       |    ✓    |    ✓     |          |
Update Bug Status      |   ✓   |    ✓    |    ✓*    |          |    ✓**
Create Bugs            |   ✓   |    ✓    |    ✓     |    ✓     |    ✓
View All Company Bugs  |   ✓   |    ✓    |    ✓     |    ✓     |
View Own Bugs          |   ✓   |    ✓    |    ✓     |    ✓     |    ✓
*Developer can only update Open → In Progress for assigned bugs
**User can only update In Progress → Closed for bugs they reported
Future Features (V2.0+)
V2.0 - Enhanced Integration & Real-time Features

Real-time Updates: WebSocket implementation for live dashboard updates
GitHub Integration: Bidirectional sync with GitHub issues
Notification System: Email, in-app, and Slack notifications
File Uploads: Screenshot and screen recording support
Advanced Widget Security: Rate limiting and spam protection

V2.1 - Analytics & Reporting

Analytics dashboard with bug trends and team performance metrics
Custom reporting templates and data export
Widget analytics and usage tracking
Resolution time analytics and SLA tracking

V2.2 - Enterprise Features

Advanced Widget Customization: Theme editor, custom CSS uploads
SSO Integration: SAML, OAuth, Active Directory
API Access: REST API with webhooks for third-party integrations
White-label Solutions: Custom branding and domain hosting


🗂️ Database Architecture
Updated Entity Relationship Diagram
sql-- Users Table (Enhanced with Role Management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    skills TEXT[], -- Array of skills
    is_super_admin BOOLEAN DEFAULT false, -- Super admin flag
    notification_preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table (With Approval Status)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, suspended
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memberships Table (Enhanced Role Management)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- company_admin, developer, reporter, user
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id), -- Company admin who created this membership
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, company_id)
);

-- Projects Table (Enhanced with Token Security)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    project_url VARCHAR(500),
    
    -- Widget Configuration
    widget_token UUID DEFAULT gen_random_uuid(), -- Non-regeneratable token
    allowed_domains TEXT[], -- Domain restrictions
    widget_config JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, slug),
    UNIQUE(widget_token)
);

-- Enhanced Bugs Table
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    
    -- Bug Classification
    severity VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    priority VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    category VARCHAR(50), -- ui, backend, performance, security, etc.
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, closed
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    
    -- Reporter Information (Enhanced for External Users)
    reporter_email VARCHAR(255) NOT NULL, -- Always captured from widget
    reporter_user_id UUID REFERENCES users(id), -- NULL if external user
    reporter_type VARCHAR(20) DEFAULT 'external', -- internal, external, unverified
    
    -- Technical Details (Enhanced Error Capture)
    user_agent TEXT,
    browser_info JSONB,
    screen_resolution VARCHAR(20),
    viewport_size VARCHAR(20),
    page_url VARCHAR(1000),
    console_errors JSONB, -- Array of console error objects
    javascript_errors JSONB, -- Stack traces and error details
    error_metadata JSONB DEFAULT '{}', -- File names, line numbers, etc.
    
    -- Future: GitHub Integration (V2.0)
    github_issue_url VARCHAR(500),
    github_issue_number INTEGER,
    
    -- Tracking
    estimated_hours INTEGER,
    actual_hours INTEGER,
    resolution_notes TEXT,
    
    -- Timestamps
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bug Comments Table (Enhanced)
CREATE TABLE bug_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment', -- comment, status_change, assignment
    metadata JSONB DEFAULT '{}',
    is_internal BOOLEAN DEFAULT false, -- Internal team comments vs public
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Bug Activities Table (Audit Trail)
CREATE TABLE bug_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- created, assigned, status_changed, priority_changed
    old_value TEXT,
    new_value TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Widget Analytics Table (Enhanced)
CREATE TABLE widget_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- widget_loaded, bug_reported, error_captured
    session_id VARCHAR(100),
    user_agent TEXT,
    page_url VARCHAR(1000),
    domain VARCHAR(255),
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Future: Notifications Table (V2.0)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
