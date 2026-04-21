/**
 * HomeRedirect — decides where to send the user on app launch.
 * - Children exist  → /profiles  ("Who's watching?")
 * - No children yet → /dashboard (parent setup flow)
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listChildren } from '@/api/client'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    listChildren()
      .then((kids) => {
        if (kids.length > 0) {
          navigate('/profiles', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => {
        // Token invalid — ProtectedRoute will handle the redirect to /login
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      })
  }, [navigate])

  // Brief loading state while the API resolves
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
