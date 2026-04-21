/**
 * usePermissions – lightweight permission helpers used by PermissionDemo
 * and any future permission-gated UI.
 *
 * In this app all authenticated users are "parents" (no admin roles),
 * so the permission checks default to sensible values. Extend this file
 * when role-based access control is introduced on the backend.
 */

import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

// ---------------------------------------------------------------------------
// Static permission helpers (do not require a hook)
// ---------------------------------------------------------------------------
export const permissions = {
  /** Everyone who is logged in can view test/demo pages. */
  canViewTests: () => true,

  /** No admin role exists yet – always returns false. */
  isAdmin: () => false,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePermissions() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  /**
   * Redirect the user to the 403 Forbidden page.
   */
  const redirectToForbidden = () => navigate('/forbidden')

  /**
   * Check a boolean condition and redirect to /forbidden when it is false.
   * Returns the same boolean so callers can early-return with `if (!check…)`.
   */
  const checkPermission = (hasPermission: boolean): boolean => {
    if (!isAuthenticated || !hasPermission) {
      redirectToForbidden()
      return false
    }
    return true
  }

  return { redirectToForbidden, checkPermission, isAuthenticated }
}
