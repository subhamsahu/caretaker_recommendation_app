import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock notification data
const notifications = [
  {
    id: 1,
    type: "success",
    title: "Test Suite Completed",
    message: "Web Application Tests completed successfully with 24/24 tests passing",
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Test Execution Delayed",
    message: "API Test Suite execution is delayed due to server maintenance",
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "New Test Report Available",
    message: "Performance test report for mobile app is ready for review",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    type: "error",
    title: "Test Failure Alert",
    message: "3 tests failed in the authentication module",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Scheduled Maintenance",
    message: "System maintenance scheduled for tonight at 11 PM EST",
    timestamp: "3 hours ago",
    read: true,
  },
]

const getNotificationIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export function NotificationSidebar() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="">
                {unreadCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 p-3">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
            <Button variant="outline" size="sm">
              Clear All
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    !notification.read 
                      ? "bg-muted/50 border-l-4 border-l-primary" 
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? "font-semibold" : ""
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
