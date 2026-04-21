import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
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
import Settings from '@/pages/Settings'
import GamesHub from '@/pages/GamesHub'
import GamePlay from '@/pages/GamePlay'

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
        element: <Navigate to="/profiles" replace />,
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
      {
        path: 'child/:childId/games',
        element: <GamesHub />,
      },
      {
        path: 'child/:childId/game/:gameId',
        element: <GamePlay />,
      },
      {
        path: 'games',
        element: <GamesHub />,
      },
      {
        path: 'games/:gameId',
        element: <GamePlay />,
      },
      {
        path: 'settings',
        element: <Settings />,
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