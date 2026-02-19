import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/layout/layout'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import AddChild from '@/pages/AddChild'
import ProfileSelector from '@/pages/ProfileSelector'
import MoodSelector from '@/pages/MoodSelector'
import RecommendationFeed from '@/pages/RecommendationFeed'
import VideoPlayer from '@/pages/VideoPlayer'
import NotFoundPage from '@/pages/NotFound'
import ProtectedRoute from '@/components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profiles',
        element: <ProfileSelector />,
      },
      {
        path: 'add-child',
        element: <AddChild />,
      },
      {
        path: 'child/:childId/mood',
        element: <MoodSelector />,
      },
      {
        path: 'child/:childId/feed',
        element: <RecommendationFeed />,
      },
      {
        path: 'child/:childId/watch',
        element: <VideoPlayer />,
      },
    ],
  },
  // 404 catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}