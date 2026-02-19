/**
 * Parent Dashboard — shows per-child watch-time stats, learning ratio,
 * top categories. Provides navigation to create children and child mode.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getParentDashboard, listChildren } from "@/api/client"
import type { ParentDashboard, Child } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Play } from "lucide-react"

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<ParentDashboard | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, kids] = await Promise.all([
          getParentDashboard(),
          listChildren(),
        ])
        setDashboard(dash)
        setChildren(kids)
      } catch {
        localStorage.removeItem("token")
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  if (loading) {
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Quick access: launch child mode */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select a child to start watching</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {children.map((c) => (
              <Button
                key={c.id}
                variant="secondary"
                onClick={() => navigate(`/child/${c.id}/mood`)}
              >
                <Play className="mr-2 h-4 w-4" />
                {c.name} (Age {c.age})
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {children.length === 0 && (
        <Card className="text-center py-10">
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              No child profiles yet. Create one to get started!
            </p>
            <Button onClick={() => navigate("/add-child")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Child
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Per-child stats */}
      {dashboard && dashboard.children.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Watch Time Overview</h2>

          {dashboard.children.map((child) => (
            <Card key={child.child_name}>
              <CardHeader>
                <CardTitle>{child.child_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-2xl font-bold">
                      {child.total_watch_minutes}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Minutes</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                    <p className="text-2xl font-bold">
                      {(child.learning_ratio * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Learning</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                    <p className="text-2xl font-bold">
                      {(child.entertainment_ratio * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Entertainment</p>
                  </div>
                </div>

                {child.top_categories.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      Top Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {child.top_categories.map((cat) => (
                        <Badge key={cat.category} variant="secondary">
                          {cat.category} — {cat.total_minutes} min
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}