import { usePermissions, permissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PermissionDemo() {
  const { redirectToForbidden, checkPermission } = usePermissions()

  const handleAdminActionClick = () => {
    // Example: Check permission before performing action
    const hasPermission = permissions.isAdmin()
    if (!checkPermission(hasPermission)) {
      return // Will redirect to forbidden page
    }
    
    // If we reach here, user has permission
    alert('Admin action performed successfully!')
  }

  const handleDirectForbiddenRedirect = () => {
    redirectToForbidden()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Permission System Demo</h2>
        <p className="text-muted-foreground">
          Test the permission system and 403 Forbidden page
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permission Check
            </CardTitle>
            <CardDescription>
              Test permission-based actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Permissions:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {permissions.canViewTests() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Can View Tests: {permissions.canViewTests() ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {permissions.isAdmin() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Is Admin: {permissions.isAdmin() ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleAdminActionClick}
              variant="destructive"
              className="w-full"
            >
              Try Admin Action (Will Redirect if No Permission)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Direct Redirect
            </CardTitle>
            <CardDescription>
              Directly navigate to the 403 Forbidden page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to see the 403 Forbidden page in action.
            </p>
            <Button 
              onClick={handleDirectForbiddenRedirect}
              variant="outline"
              className="w-full"
            >
              View 403 Forbidden Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
