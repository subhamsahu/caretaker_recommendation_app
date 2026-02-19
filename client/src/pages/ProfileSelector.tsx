/**
 * Profile selector — child picks their profile to enter "child mode".
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listChildren } from "@/api/client"
import type { Child } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowLeft } from "lucide-react"

const AVATARS = ["\u{1F9D1}\u200D\u{1F393}", "\u{1F467}", "\u{1F466}", "\u{1F9D2}", "\u{1F476}", "\u{1F9D2}\u{1F3FD}"]

export default function ProfileSelector() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    listChildren()
      .then(setChildren)
      .catch(() => navigate("/login"))
  }, [navigate])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Who's watching?</h1>
        <p className="text-muted-foreground">Pick a profile to get started</p>
      </div>

      <div className="flex flex-wrap gap-6 justify-center">
        {children.map((child, idx) => (
          <Card
            key={child.id}
            className="w-40 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(`/child/${child.id}/mood`)}
          >
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <span className="text-5xl">{AVATARS[idx % AVATARS.length]}</span>
              <p className="font-bold text-lg">{child.name}</p>
              <p className="text-sm text-muted-foreground">Age {child.age}</p>
            </CardContent>
          </Card>
        ))}

        {/* Add Child card */}
        <Card
          className="w-40 cursor-pointer hover:scale-105 transition-transform border-dashed"
          onClick={() => navigate("/add-child")}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <UserPlus className="h-12 w-12" />
            <p className="font-semibold">Add Child</p>
          </CardContent>
        </Card>
      </div>

      <Button variant="link" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>
  )
}
