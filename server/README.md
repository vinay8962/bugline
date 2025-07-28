# BugLine Backend API

A robust Node.js + Express REST API for the BugLine bug tracking and management system, built with Supabase as the database.

## 🏗️ Architecture

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase configuration
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
│   └── server.js                # Main server file
├── package.json
├── env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with the 3-table structure

### Installation

1. **Install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your Supabase credentials:

   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📊 Database Structure

The API works with a 3-table structure:

### Users Table

- `id` (UUID, Primary Key)
- `email` (Text, Required)
- `full_name` (Text, Optional)
- `phone` (Text, Optional)
- `avatar_url` (Text, Optional)
- `global_role` (Text, Default: 'user')
- `bio` (Text, Optional)
- `timezone` (Text, Default: 'UTC')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Companies Table

- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `description` (Text, Optional)
- `logo_url` (Text, Optional)
- `website` (Text, Optional)
- `settings` (JSONB, Default: {})
- `industry` (Text, Optional)
- `size` (Text, Optional)
- `created_by` (UUID, Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Memberships Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `company_id` (UUID, Foreign Key)
- `role` (Text, Required)
- `permissions` (JSONB, Default: {})
- `title` (Text, Optional)
- `department` (Text, Optional)
- `status` (Text, Default: 'active')
- `invited_by` (UUID, Foreign Key)
- `invited_at` (Timestamp)
- `joined_at` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 🔐 Authentication & Authorization

### JWT Authentication

- All protected routes require a valid JWT token
- Token format: `Bearer <token>`
- Tokens are verified against Supabase auth.users

### Role-Based Access Control

- **Global Roles**: `super_admin`, `user`
- **Company Roles**: `admin`, `dev`, `bug_reporter`, `viewer`
- **Membership Status**: `active`, `inactive`, `pending`, `suspended`

### Permission System

- JSON-based permissions stored in `memberships.permissions`
- Custom permissions can be defined per membership
- Admin role has full access to company resources

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
- `PUT /:userId/role` - Update user global role (super admin)

### Companies API (`/api/v1/companies`)

- `GET /` - Get all companies
- `POST /` - Create company
- `GET /search` - Search companies (public)
- `GET /industry/:industry` - Get companies by industry (public)
- `GET /name/:name` - Get company by name (public)
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
| `SUPABASE_URL`              | Supabase project URL      | Required                |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key    | Required                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required                |
| `JWT_SECRET`                | JWT signing secret        | Required                |
| `JWT_EXPIRES_IN`            | JWT expiration time       | `7d`                    |
| `RATE_LIMIT_WINDOW_MS`      | Rate limit window         | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS`   | Max requests per window   | `100`                   |
| `CORS_ORIGIN`               | Allowed CORS origin       | `http://localhost:5173` |
| `LOG_LEVEL`                 | Logging level             | `info`                  |

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
