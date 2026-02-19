# KidCare - Client

A modern React frontend application for the KidCare recommendation platform, built with TypeScript, Vite, Redux Toolkit, and React Router. Features include authentication, child profile management, mood-based video recommendations, and comprehensive parental controls.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd recommendor_app/client_new_design

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port)

### 🔑 Development Login

The application includes a development mode with dummy credentials for easy testing:

- **Email**: `parent@kidcare.app`
- **Password**: `admin123`

A blue development helper box will appear on the login form with a "Fill Dummy Credentials" button.

## 📁 Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── app-sidebar.tsx # Main application sidebar
│   │   ├── login-form.tsx  # Authentication form with dev mode
│   │   ├── nav-*.tsx       # Navigation components
│   │   ├── ProtectedRoute.tsx # Route protection component
│   │   ├── notification-sidebar.tsx # Notification system
│   │   ├── ErrorBoundary.tsx # Error boundary for runtime errors
│   │   └── PermissionDemo.tsx # Permission system demo
│   ├── config/             # Configuration files
│   │   └── development.js  # Development mode configuration
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.ts   # Mobile detection hook
│   │   └── usePermissions.ts # Permission management hooks
│   ├── layout/             # Layout components
│   │   └── layout.tsx      # Main layout with header and notification icon
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Tests.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx    # Enhanced with permission examples
│   │   ├── NotFound.tsx    # 404 error page
│   │   └── Forbidden.tsx   # 403 error page
│   ├── routes/             # Router configuration
│   │   └── index.tsx       # Includes error page routing
│   ├── store/              # Redux store configuration
│   │   ├── index.ts        # Store setup
│   │   ├── hooks.ts        # Typed Redux hooks
│   │   └── slices/         # Redux slices
│   │       └── authSlice.ts # Enhanced with dev mode support
│   ├── App.tsx             # Main app component with ErrorBoundary
│   ├── index.css           # Global styles with custom blue theme
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── package.json
└── README.md
```

## 🛠 Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Build tool support (configured with relaxed typing)
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management (includes Redux Thunk)
- **React Router** - Client-side routing with error pages
- **Tailwind CSS** - Styling with custom blue theme (`oklch(0.39 0.08 241)`)
- **shadcn/ui** - UI component library
- **Lucide React** - Icons
- **class-variance-authority** - Component variant management

## 🎨 Theme Customization

The application uses a custom blue theme. The primary color is defined in `src/index.css`:

```css
:root {
  --primary: oklch(0.39 0.08 241); /* Custom blue */
  /* Light theme colors */
}

.dark {
  --primary: oklch(0.5 0.12 241); /* Lighter blue for dark mode */
  /* Dark theme colors */
}
```

To change the theme color, update these OKLCH values in the CSS file.

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Login form with form validation
- **Development Mode**: Includes dummy credentials for easy testing
- Protected routes with automatic redirects
- Persistent login state with localStorage

### 🎯 Routing & Navigation
- React Router with nested routes
- Protected routes requiring authentication
- Sidebar navigation with collapsible menu
- Breadcrumb navigation
- **Error Pages**: Custom 404 (Not Found) and 403 (Forbidden) pages
- Error boundaries for runtime error handling

### 🔔 Notification System
- Notification icon in top bar with unread count badge
- Right-side notification sidebar with:
  - Real-time notifications
  - Mark as read/unread functionality
  - Notification filtering and sorting
  - Clear all notifications option
- Responsive design adapting to mobile screens

### 🛡️ Permission Management
- Role-based access control system
- Permission guards for components and routes
- Custom `usePermissions` hook for permission checks
- Automatic redirection to forbidden page for unauthorized access
- Permission examples in Settings page

### 🚨 Error Handling
- **Error Boundary**: Catches React runtime errors with recovery options
- **404 Page**: Professional not found page with navigation options
- **403 Page**: Access forbidden page with admin contact information
- Development mode shows detailed error information

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Custom blue theme using OKLCH color system
- shadcn/ui components for consistent design
- Mobile-responsive sidebar and navigation
- Dark/light theme support

### 🔧 Development Features
- **Development Helper**: Automatic credential filling on login form
- Hot reload with Vite development server
- TypeScript with relaxed configuration for faster development
- Redux DevTools integration

## 🗺️ Routing (React Router)

### Route Structure

The application uses a nested routing structure:

```
/ (redirects to /dashboard if authenticated, otherwise /login)
/login (public route)
/dashboard (protected)
├── /dashboard (overview)
└── /dashboard/stats (statistics)
/tests (protected)
├── /tests (all tests)
├── /tests/suites (test suites)
├── /tests/cases (test cases)
└── /tests/keywords (keywords)
/reports (protected)
├── /reports (test results)
├── /reports/history (execution history)
├── /reports/performance (performance metrics)
└── /reports/coverage (coverage reports)
/settings (protected)
├── /settings (general settings)
├── /settings/users (user management)
├── /settings/integrations (integrations)
└── /settings/environment (environment config)
```

### Usage Examples

#### Basic Navigation

```jsx
import { Link, useNavigate } from 'react-router-dom'

function MyComponent() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Declarative navigation */}
      <Link to="/dashboard">Go to Dashboard</Link>
      
      {/* Programmatic navigation */}
      <button onClick={() => navigate('/tests')}>
        View Tests
      </button>
      
      {/* Navigation with state */}
      <button onClick={() => navigate('/reports', { state: { from: 'dashboard' } })}>
        View Reports
      </button>
    </div>
  )
}
```

#### Protected Routes

Routes are automatically protected using the `ProtectedRoute` component:

```jsx
// routes/index.jsx
{
  path: '/',
  element: (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  ),
  children: [
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'tests', element: <Tests /> },
    // ... other protected routes
  ]
}
```

#### Route Parameters

```jsx
// Define route with parameters
{ path: '/tests/:testId', element: <TestDetail /> }

// Access parameters in component
import { useParams } from 'react-router-dom'

function TestDetail() {
  const { testId } = useParams()
  return <div>Test ID: {testId}</div>
}
```

#### Query Parameters

```jsx
import { useSearchParams } from 'react-router-dom'

function TestList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter')

  const handleFilterChange = (newFilter) => {
    setSearchParams({ filter: newFilter })
  }

  return (
    <div>
      <input 
        value={filter || ''} 
        onChange={(e) => handleFilterChange(e.target.value)}
        placeholder="Filter tests..."
      />
    </div>
  )
}
```

## 🏪 State Management (Redux Toolkit)

### Store Structure

```javascript
{
  auth: {
    user: null, // User object when logged in
    token: null, // Authentication token
    isLoading: false, // Loading state
    error: null, // Error message
    isAuthenticated: false // Authentication status
  }
  // Add more slices as needed
}
```

### Usage Examples

#### Using Redux in Components

```jsx
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, logoutUser, clearError } from '@/store/slices/authSlice'

function LoginComponent() {
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth)

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials))
      if (loginUser.fulfilled.match(result)) {
        // Login successful
        console.log('Login successful')
      }
    } catch (error) {
      // Handle error
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const clearLoginError = () => {
    dispatch(clearError())
  }

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearLoginError}>Clear</button>
        </div>
      )}
      
      <button 
        onClick={() => handleLogin({ email: 'user@test.com', password: 'password' })}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      {isAuthenticated && (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  )
}
```

#### Creating New Redux Slices

```jsx
// store/slices/testsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  tests: [],
  isLoading: false,
  error: null,
}

// Async thunk for fetching tests
export const fetchTests = createAsyncThunk(
  'tests/fetchTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tests')
      if (!response.ok) throw new Error('Failed to fetch tests')
      return await response.json()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  }
)

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateTestStatus: (state, action) => {
      const { testId, status } = action.payload
      const test = state.tests.find(t => t.id === testId)
      if (test) {
        test.status = status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.isLoading = false
        state.tests = action.payload
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateTestStatus } = testsSlice.actions
export default testsSlice.reducer
```

#### Adding Slice to Store

```jsx
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import testsSlice from './slices/testsSlice' // New slice

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tests: testsSlice, // Add new slice
  },
  // ... rest of configuration
})
```

#### Using the New Slice

```jsx
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchTests, updateTestStatus } from '@/store/slices/testsSlice'

function TestsPage() {
  const dispatch = useAppDispatch()
  const { tests, isLoading, error } = useAppSelector(state => state.tests)

  useEffect(() => {
    dispatch(fetchTests())
  }, [dispatch])

  const handleStatusUpdate = (testId, status) => {
    dispatch(updateTestStatus({ testId, status }))
  }

  if (isLoading) return <div>Loading tests...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {tests.map(test => (
        <div key={test.id}>
          <h3>{test.name}</h3>
          <p>Status: {test.status}</p>
          <button onClick={() => handleStatusUpdate(test.id, 'running')}>
            Run Test
          </button>
        </div>
      ))}
    </div>
  )
}
```

## 🔐 Authentication Flow

1. **Initial Load**: App checks for stored token in localStorage
2. **Login**: User submits credentials → Redux dispatches `loginUser` → Token stored
3. **Route Protection**: `ProtectedRoute` component checks authentication state
4. **Logout**: User clicks logout → Redux dispatches `logoutUser` → Token cleared → Redirect to login

```jsx
// Authentication flow example
function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth)

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  )
}
```

## 🔔 Notification System

### Using Notifications

The notification system provides real-time updates and user interactions:

```jsx
// Using notifications in any component
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addNotification, markAsRead, clearAllNotifications } from '@/store/slices/notificationSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(state => state.notifications)

  // Add a new notification
  const handleAddNotification = () => {
    dispatch(addNotification({
      id: Date.now(),
      title: 'Test Completed',
      message: 'Your test execution has finished successfully.',
      type: 'success',
      timestamp: new Date().toISOString(),
      isRead: false
    }))
  }

  // Mark notification as read
  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId))
  }

  // Clear all notifications
  const handleClearAll = () => {
    dispatch(clearAllNotifications())
  }

  return (
    <div>
      <button onClick={handleAddNotification}>
        Add Test Notification
      </button>
      <p>Unread: {notifications.filter(n => !n.isRead).length}</p>
    </div>
  )
}
```

### Notification Types

```jsx
// Different notification types with styling
const notificationTypes = {
  success: { icon: CheckCircle, color: 'text-green-600' },
  error: { icon: XCircle, color: 'text-red-600' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600' },
  info: { icon: Info, color: 'text-blue-600' }
}

// Usage in notification sidebar
function NotificationItem({ notification }) {
  const { icon: Icon, color } = notificationTypes[notification.type]
  
  return (
    <div className={`p-3 border-b ${notification.isRead ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${color} mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>
      </div>
    </div>
  )
}
```

## 🛡️ Permission Management

### Using Permission Guards

Protect components and routes based on user permissions:

```jsx
import { usePermissions, PermissionGuard } from '@/hooks/usePermissions'

function AdminPanel() {
  const { hasPermission, hasRole } = usePermissions()

  return (
    <div>
      {/* Simple permission check */}
      {hasPermission('user.delete') && (
        <button className="bg-red-600 text-white px-4 py-2 rounded">
          Delete User
        </button>
      )}

      {/* Role-based check */}
      {hasRole('admin') && (
        <div>
          <h3>Admin-only content</h3>
          <p>This is only visible to administrators</p>
        </div>
      )}

      {/* Permission Guard Component */}
      <PermissionGuard permission="user.create">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Create User
        </button>
      </PermissionGuard>

      {/* Multiple permissions (any) */}
      <PermissionGuard permissions={['user.edit', 'user.view']} requireAll={false}>
        <UserEditForm />
      </PermissionGuard>

      {/* Multiple permissions (all required) */}
      <PermissionGuard permissions={['admin.access', 'user.manage']} requireAll={true}>
        <AdminUserManagement />
      </PermissionGuard>
    </div>
  )
}
```

### Route Protection

```jsx
// routes/index.jsx
import { PermissionRoute } from '@/hooks/usePermissions'

{
  path: '/admin',
  element: (
    <PermissionRoute permission="admin.access">
      <AdminLayout />
    </PermissionRoute>
  ),
  children: [
    {
      path: 'users',
      element: (
        <PermissionRoute permission="user.manage">
          <UserManagement />
        </PermissionRoute>
      )
    }
  ]
}
```

### Permission Hook Usage

```jsx
function UserActions({ userId }) {
  const { hasPermission, redirectToForbidden } = usePermissions()
  const navigate = useNavigate()

  const handleDeleteUser = () => {
    if (!hasPermission('user.delete')) {
      redirectToForbidden('You need user deletion permissions to perform this action.')
      return
    }
    
    // Proceed with deletion
    deleteUser(userId)
  }

  const handleEditUser = () => {
    if (!hasPermission('user.edit')) {
      // Alternative: redirect manually
      navigate('/forbidden', { 
        state: { 
          message: 'You need user editing permissions to access this page.' 
        }
      })
      return
    }
    
    navigate(`/users/${userId}/edit`)
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleEditUser}
        disabled={!hasPermission('user.edit')}
        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Edit
      </button>
      
      <button 
        onClick={handleDeleteUser}
        disabled={!hasPermission('user.delete')}
        className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
```

## 🚨 Error Handling Examples

### Error Boundary Usage

```jsx
// Wrap components that might throw errors
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

// The error boundary will catch any errors in child components
function ProblematicComponent() {
  const [error, setError] = useState(false)
  
  if (error) {
    throw new Error('This is a test error!')
  }
  
  return (
    <div>
      <button onClick={() => setError(true)}>
        Trigger Error (for testing)
      </button>
    </div>
  )
}
```

### Custom Error Pages

```jsx
// 404 Error Page (src/pages/NotFound.tsx)
export default function NotFound() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto" />
        <div>
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🎨 Component Development

### Creating New Pages

```jsx
// pages/NewPage.jsx
export default function NewPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <h2 className="text-2xl font-bold">New Page Content</h2>
      </div>
    </div>
  )
}

// Add to routes/index.jsx
{
  path: 'new-page',
  element: <NewPage />,
}
```

### Adding Navigation Items

```jsx
// Update components/app-sidebar.jsx
const data = {
  navMain: [
    // ... existing items
    {
      title: "New Section",
      url: "/new-page",
      icon: YourIcon,
      items: [
        {
          title: "Sub Page",
          url: "/new-page/sub",
        },
      ],
    },
  ],
}
```

## 🧪 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# The built files will be in the 'dist' directory
# Serve the dist directory with any static file server
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=KidCare
```

Access in code:

```jsx
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
```

### Customizing the Theme

The application uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add custom colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## 🚨 Common Patterns

### Loading States

```jsx
function DataComponent() {
  const { data, isLoading, error } = useAppSelector(state => state.someSlice)

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>
  }

  return <div>{/* Render data */}</div>
}
```

### Form Handling with Redux

```jsx
function FormComponent() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.someSlice)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(submitForm(formData)).unwrap()
      // Handle success
      setFormData({ name: '', email: '' })
    } catch (error) {
      // Handle error
      console.error('Form submission failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Name"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

## � User Guide

### Getting Started

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Open your browser to `http://localhost:5173`
   - You'll be redirected to the login page if not authenticated

3. **Login (Development Mode)**
   - Use the "Fill Dummy Credentials" button for quick access
   - Or manually enter:
     - Email: `parent@kidcare.app`
     - Password: `admin123`

### Using the Application

#### Navigation
- **Sidebar Navigation**: Click the menu items to navigate between pages
- **Collapsible Sidebar**: Use the hamburger menu to collapse/expand
- **Mobile**: Sidebar automatically adapts for mobile screens

#### Notifications
- **Bell Icon**: Click the notification bell in the top bar
- **Notification Count**: Red badge shows unread notifications
- **Notification Sidebar**: 
  - Mark individual notifications as read/unread
  - Clear all notifications at once
  - Notifications persist across page refreshes

#### Error Handling
- **Runtime Errors**: Caught by error boundary with recovery options
- **Page Not Found**: Custom 404 page with helpful navigation
- **Access Denied**: 403 page with admin contact information
- **Development Mode**: Shows detailed error information for debugging

#### Permission System
- **Role-Based Access**: Some features require specific permissions
- **Automatic Redirects**: Unauthorized access redirects to forbidden page
- **Permission Examples**: Visit Settings page to see permission demos

### Development Features

#### Development Mode Helpers
- **Auto-fill Login**: One-click credential filling on login form
- **Error Details**: Enhanced error information in development
- **Hot Reload**: Changes reflected immediately without page refresh

#### Customization
- **Theme Colors**: Modify OKLCH values in `src/index.css`
- **Component Variants**: Use class-variance-authority for component styling
- **Responsive Design**: All components are mobile-responsive by default

### Troubleshooting

#### Common Issues

1. **Login Not Working**
   - Ensure you're using the correct development credentials
   - Check browser console for authentication errors
   - Clear localStorage and try again

2. **Page Not Loading**
   - Check if you're accessing a protected route without authentication
   - Verify the route exists in the router configuration
   - Look for error boundary messages

3. **Notifications Not Showing**
   - Check if notifications are being added to Redux store
   - Verify notification sidebar is not hidden on mobile

4. **Permission Errors**
   - Check user role and permissions in Redux store
   - Verify permission guards are properly configured
   - Review console for permission-related errors

#### Development Tips

- **Redux DevTools**: Install browser extension for state debugging
- **React DevTools**: Use for component inspection and profiling
- **TypeScript**: Relaxed configuration allows for faster development
- **Error Boundary**: Wraps the entire app to catch runtime errors

## �📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
