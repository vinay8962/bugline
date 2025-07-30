# BugLine Backend API

A robust Node.js + Express REST API for the BugLine bug tracking and management system, built with Prisma ORM and Supabase PostgreSQL database.

## 🏗️ Architecture

```
server/
├── src/
│   ├── config/
│   │   └── prisma.js           # Prisma client configuration
│   ├── controllers/
│   │   ├── userController.js     # User management endpoints
│   │   ├── companyController.js  # Company management endpoints
│   │   └── membershipController.js # Membership management endpoints
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   ├── validation.js        # Request validation with Joi
│   │   └── errorHandler.js      # Error handling middleware
│   ├── routes/
│   │   ├── userRoutes.js        # User API routes
│   │   ├── companyRoutes.js     # Company API routes
│   │   ├── membershipRoutes.js  # Membership API routes
│   │   └── index.js             # Main routes configuration
│   ├── services/
│   │   ├── userService.js       # User business logic
│   │   ├── companyService.js    # Company business logic
│   │   └── membershipService.js # Membership business logic
│   ├── app.js                   # Express app configuration
│   └── server.js                # Main server file
├── prisma/
│   └── schema.prisma           # Database schema definition
├── package.json
├── env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with PostgreSQL database

### Installation

1. **Install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**

   Create a `.env` file in the `packages/server` directory:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Email Configuration (for email verification)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # App Configuration
   APP_NAME=BugLine
   APP_URL=http://localhost:3000
   ```

3. **Database Setup:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (development)
   npm run db:push

   # Or use migrations (production)
   npm run db:migrate
   ```

4. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📊 Database Schema

The Prisma schema includes a complete MVC architecture:

### Models (Prisma Schema)
- **User**: Enhanced user profiles with skills and notification preferences
- **Company**: Multi-tenant organizations with subscription plans
- **Membership**: User-company relationships with role-based access
- **Project**: Projects within companies with GitHub integration
- **Bug**: Comprehensive bug reports with metadata and GitHub linking

### Database Structure

#### User Table
- `id` (String, Primary Key, UUID)
- `email` (String, Unique)
- `passwordHash` (String)
- `firstName` (String)
- `lastName` (String)
- `githubUsername` (String, Optional)
- `timezone` (String, Default: "UTC")
- `skills` (String[])
- `notificationPreferences` (Json, Optional)
- `createdAt` (DateTime)

#### Company Table
- `id` (String, Primary Key, UUID)
- `name` (String)
- `slug` (String, Unique)
- `subscriptionPlan` (String, Default: "free")
- `githubOrgName` (String, Optional)
- `settings` (Json, Optional)
- `createdAt` (DateTime)

#### Membership Table
- `id` (String, Primary Key, UUID)
- `userId` (String, Foreign Key)
- `companyId` (String, Foreign Key)
- `role` (CompanyRole Enum)
- `permissions` (Json, Optional)
- `joinedAt` (DateTime)

#### Project Table
- `id` (String, Primary Key, UUID)
- `companyId` (String, Foreign Key)
- `name` (String)
- `slug` (String)
- `githubRepoUrl` (String, Optional)
- `widgetConfig` (Json, Optional)
- `createdAt` (DateTime)

#### Bug Table
- `id` (String, Primary Key, UUID)
- `projectId` (String, Foreign Key)
- `title` (String)
- `description` (String)
- `severity` (BugSeverity Enum, Default: medium)
- `status` (BugStatus Enum, Default: open)
- `assignedToId` (String, Foreign Key, Optional)
- `reporterId` (String, Foreign Key, Optional)
- `reporterEmail` (String, Optional)
- `userAgent` (String, Optional)
- `browserInfo` (Json, Optional)
- `pageUrl` (String, Optional)
- `screenshots` (String[])
- `githubIssueUrl` (String, Optional)
- `createdAt` (DateTime)

### Enums
- **CompanyRole**: admin, developer, qa, viewer
- **BugSeverity**: critical, high, medium, low
- **BugStatus**: open, in_progress, fixed, closed

## 🔧 Available Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:migrate:deploy` - Deploy migrations to production
- `npm run db:reset` - Reset database and apply migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio for database management

## 🏗️ MVC Architecture

### Models (Prisma Schema)
- `User` - User authentication and profile management
- `Company` - Multi-tenant organization management
- `Membership` - User-company relationships with roles
- `Project` - Project management within companies
- `Bug` - Comprehensive bug tracking with metadata

### Views (API Responses)
- RESTful API endpoints
- JSON responses with proper status codes
- Error handling and validation

### Controllers (Route Handlers)
- `authController.js` - Authentication logic
- `userController.js` - User management
- `companyController.js` - Company operations
- `membershipController.js` - Membership management
- `adminController.js` - Admin operations

## 🔐 Authentication & Authorization

### JWT Authentication

- All protected routes require a valid JWT token
- Token format: `Bearer <token>`
- Tokens are verified against Prisma User model

### Role-Based Access Control

- **Company Roles**: `admin`, `developer`, `qa`, `viewer`
- **Bug Severities**: `critical`, `high`, `medium`, `low`
- **Bug Statuses**: `open`, `in_progress`, `fixed`, `closed`

### Role Permissions

- **admin**: Company creator/manager (full company access)
- **developer**: Can work on bugs, update status, assign bugs to themselves
- **qa**: Designated bug poster (professional QA role) - can only post bugs
- **viewer**: General users who can view bugs and comment

## 📡 API Endpoints

### Health & Documentation

- `GET /health` - Health check
- `GET /docs` - API documentation

### Users API (`/api/v1/users`)

- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `GET /me/companies` - Get current user's companies
- `GET /me/stats` - Get current user statistics
- `GET /` - Get all users (admin)
- `GET /search` - Search users
- `GET /:userId` - Get user by ID
- `PUT /:userId` - Update user (admin)
- `DELETE /:userId` - Delete user (admin)
- `GET /:userId/companies` - Get user's companies
- `GET /:userId/stats` - Get user statistics

### Companies API (`/api/v1/companies`)

- `GET /` - Get all companies
- `POST /` - Create company
- `GET /search` - Search companies (public)
- `GET /:companyId` - Get company details
- `PUT /:companyId` - Update company (admin)
- `DELETE /:companyId` - Delete company (admin)
- `GET /:companyId/members` - Get company members
- `GET /:companyId/stats` - Get company statistics
- `PUT /:companyId/settings` - Update company settings (admin)
- `GET /user/:userId` - Get user's companies
- `GET /me/companies` - Get current user's companies

### Memberships API (`/api/v1/memberships`)

- `GET /` - Get all memberships
- `POST /` - Create membership
- `GET /:membershipId` - Get membership by ID
- `PUT /:membershipId` - Update membership
- `DELETE /:membershipId` - Delete membership
- `POST /company/:companyId/invite` - Invite user to company (admin)
- `GET /company/:companyId/stats` - Get membership statistics
- `GET /invitations/pending` - Get pending invitations
- `PUT /:membershipId/accept` - Accept invitation
- `PUT /:membershipId/reject` - Reject invitation
- `PUT /:membershipId/role` - Update member role (admin)
- `PUT /:membershipId/suspend` - Suspend member (admin)
- `PUT /:membershipId/reactivate` - Reactivate member (admin)
- `PUT /:membershipId/permissions` - Update member permissions (admin)
- `GET /user/:userId/company/:companyId` - Get user's company membership
- `GET /me/company/:companyId` - Get current user's company membership

### Projects API (`/api/v1/projects`)

- `GET /` - Get all projects
- `POST /` - Create project
- `GET /:projectId` - Get project details
- `PUT /:projectId` - Update project
- `DELETE /:projectId` - Delete project
- `GET /company/:companyId` - Get company's projects

### Bugs API (`/api/v1/bugs`)

- `GET /` - Get all bugs (with filters)
- `POST /` - Create bug report
- `GET /:bugId` - Get bug details
- `PUT /:bugId` - Update bug
- `DELETE /:bugId` - Delete bug
- `GET /project/:projectId` - Get project's bugs

## 🔧 Features

### ✅ Implemented

- **RESTful API Design** - Clean, consistent endpoints
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions
- **Request Validation** - Joi schema validation
- **Error Handling** - Comprehensive error responses
- **Rate Limiting** - API protection
- **CORS Support** - Cross-origin requests
- **Security Headers** - Helmet protection
- **Compression** - Response compression
- **Logging** - Request/error logging
- **Pagination** - Efficient data loading
- **Search Functionality** - User and company search
- **Statistics** - User and company analytics
- **Invitation System** - Company member invitations
- **Permission Management** - Custom JSON permissions
- **Prisma ORM** - Type-safe database operations
- **Database Migrations** - Version-controlled schema changes
- **Auto-generated Types** - JavaScript type safety

### 🚧 Planned Features

- **Email Notifications** - Invitation and update emails
- **File Upload** - Avatar and logo uploads
- **WebSocket Support** - Real-time updates
- **API Rate Limiting** - Per-user limits
- **Caching** - Redis integration
- **Audit Logging** - Activity tracking
- **Bulk Operations** - Batch processing
- **Export Functionality** - Data export

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - DDoS protection
- **Input Validation** - XSS/SQL injection prevention
- **JWT Verification** - Token validation
- **Role-Based Access** - Authorization control
- **Error Sanitization** - Safe error messages
- **Prisma Query Safety** - SQL injection prevention

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

| Variable                    | Description               | Default                 |
| --------------------------- | ------------------------- | ----------------------- |
| `PORT`                      | Server port               | `5000`                  |
| `NODE_ENV`                  | Environment               | `development`           |
| `DATABASE_URL`              | Prisma database URL       | Required                |
| `JWT_SECRET`                | JWT signing secret        | Required                |
| `JWT_EXPIRES_IN`            | JWT expiration time       | `7d`                    |
| `RATE_LIMIT_WINDOW_MS`      | Rate limit window         | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS`   | Max requests per window   | `100`                   |
| `CORS_ORIGIN`               | Allowed CORS origin       | `http://localhost:5173` |
| `LOG_LEVEL`                 | Logging level             | `info`                  |
| `SMTP_HOST`                 | SMTP server host          | `smtp.gmail.com`        |
| `SMTP_PORT`                 | SMTP server port          | `587`                   |
| `SMTP_USER`                 | SMTP username             | Required                |
| `SMTP_PASS`                 | SMTP password             | Required                |
| `APP_NAME`                  | Application name          | `BugLine`               |
| `APP_URL`                   | Application URL           | `http://localhost:3000` |

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
docker build -t bugline-backend .
docker run -p 5000:5000 bugline-backend
```

## 🚨 Important Notes

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Database URL**: Get your Supabase connection string from the Supabase dashboard
3. **Migrations**: Use migrations for production deployments
4. **Seeding**: Create seed data for development and testing
5. **Backup**: Regular database backups are recommended

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Failed**: Check your DATABASE_URL in .env
2. **Migration Errors**: Run `npm run db:reset` to start fresh
3. **Client Generation**: Run `npm run db:generate` after schema changes
4. **Permission Errors**: Ensure your database user has proper permissions

### Getting Help:

- Check Prisma documentation: https://pris.ly/docs
- Review Supabase documentation: https://supabase.com/docs
- Check the project README for additional setup instructions

## 📚 API Documentation

Visit `http://localhost:5000/docs` for interactive API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@bugline.com or create an issue in the repository.