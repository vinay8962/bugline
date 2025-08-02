# BugLine API Management Architecture

## Overview
This document describes the professional API management system implemented for BugLine using Redux Toolkit Query (RTK Query) with JavaScript/JSX.

## Architecture Components

### 1. Base API Configuration (`src/services/api.js`)
- **RTK Query Setup**: Main API slice with centralized configuration
- **Authentication Interceptors**: Automatic token attachment and refresh
- **Error Handling**: Global error handling with automatic logout on 401
- **Retry Logic**: Network error retry mechanism
- **Cache Management**: Intelligent caching with tag-based invalidation

### 2. API Service Slices

#### Authentication API (`src/services/authApi.js`)
- User registration and login
- Google OAuth integration
- Email verification
- Password reset functionality
- Token management

#### User Management API (`src/services/userApi.js`)
- User profile management
- Company user operations
- Role management
- User search and filtering
- Activity tracking

#### Company Management API (`src/services/companyApi.js`)
- Company CRUD operations
- Member management
- Invitation system
- Company statistics
- Settings management

#### Bug Tracking API (`src/services/bugApi.js`)
- Bug CRUD operations
- Assignment and status management
- Comments and attachments
- Bulk operations
- Statistics and reporting

#### Project Management API (`src/services/projectApi.js`)
- Project CRUD operations
- Member management
- Activity tracking
- Archive/restore functionality

### 3. Custom Hooks (`src/hooks/useAuth.js`)
- **useAuth**: Main authentication hook with all auth operations
- **useGoogleAuth**: Simplified Google OAuth hook
- **useAuthStatus**: Lightweight authentication status hook

### 4. UI Components

#### Error Handling (`src/components/ErrorBoundary.jsx`)
- Global error boundary for React errors
- Development error details
- User-friendly error messages
- Recovery mechanisms

#### Loading States (`src/components/LoadingSpinner.jsx`)
- Spinner components for different use cases
- Skeleton loaders
- Full-page loading screens
- Button loading states

#### Notifications (`src/utils/notifications.js`)
- Centralized toast notification system
- Context-specific notifications (auth, API, CRUD)
- Error and success messaging
- Custom notification types

### 5. Enhanced Login Component
- **RTK Query Integration**: Uses custom auth hooks
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success and error notifications

## Key Features

### 🔐 Security
- **Automatic Token Management**: Tokens attached to all requests
- **Secure Storage**: Environment-based configuration
- **Session Management**: Automatic logout on token expiry
- **CSRF Protection**: Proper authentication headers

### ⚡ Performance
- **Intelligent Caching**: Background updates and cache invalidation
- **Request Deduplication**: Prevents duplicate API calls
- **Optimistic Updates**: Immediate UI updates
- **Normalized Data**: Efficient data storage

### 🛡️ Error Handling
- **Global Error Boundary**: Catches React errors
- **API Error Handling**: Centralized error processing
- **Retry Logic**: Automatic retry for network errors
- **User Feedback**: Clear error messages and recovery options

### 📊 Developer Experience
- **Auto-generated Hooks**: No manual hook creation
- **TypeScript Ready**: Easy to add types later
- **Hot Reloading**: Development-friendly
- **Debugging Tools**: Redux DevTools integration

## Usage Examples

### Basic API Call
```javascript
import { useGetUserProfileQuery } from '../services';

function UserProfile() {
  const { data: user, isLoading, error } = useGetUserProfileQuery();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{user.name}</div>;
}
```

### Mutation with Optimistic Updates
```javascript
import { useUpdateUserProfileMutation } from '../services';
import { showSuccess, showError } from '../utils/notifications';

function EditProfile() {
  const [updateProfile, { isLoading }] = useUpdateUserProfileMutation();
  
  const handleSave = async (userData) => {
    try {
      await updateProfile(userData).unwrap();
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error.message);
    }
  };
}
```

### Authentication
```javascript
import { useAuth } from '../hooks/useAuth';

function LoginForm() {
  const { handleLogin, handleGoogleLogin } = useAuth();
  
  const onSubmit = async (formData) => {
    const result = await handleLogin(formData);
    // Automatic navigation and notifications handled by hook
  };
}
```

## File Structure
```
src/
├── services/
│   ├── api.js              # Base RTK Query configuration
│   ├── authApi.js          # Authentication endpoints
│   ├── userApi.js          # User management endpoints
│   ├── companyApi.js       # Company management endpoints
│   ├── bugApi.js           # Bug tracking endpoints
│   ├── projectApi.js       # Project management endpoints
│   └── index.js            # Export all services
├── hooks/
│   └── useAuth.js          # Authentication hooks
├── components/
│   ├── ErrorBoundary.jsx   # Global error handling
│   └── LoadingSpinner.jsx  # Loading components
├── utils/
│   └── notifications.js    # Toast notification system
└── redux/
    └── store.js            # Enhanced Redux store
```

## Benefits

1. **Centralized API Management**: All API calls in one place
2. **Consistent Error Handling**: Unified error processing
3. **Automatic Caching**: Reduced API calls and better performance
4. **Type Safety Ready**: Easy to add TypeScript later
5. **Developer Productivity**: Auto-generated hooks
6. **Scalable Architecture**: Easy to add new endpoints
7. **Better UX**: Loading states and error feedback
8. **Maintainable Code**: Clear separation of concerns

## Next Steps

1. **Add TypeScript**: Enhance type safety
2. **Implement Offline Support**: Cache and sync functionality
3. **Add Real-time Updates**: WebSocket integration
4. **Performance Monitoring**: Add metrics and analytics
5. **Advanced Caching**: Background sync and persistence
6. **Error Reporting**: Integration with error tracking services

This architecture provides a solid foundation for BugLine's API management needs, following industry best practices while remaining maintainable and scalable.