/**
 * Mood selection — child picks how they feel right now.
 */

import { useNavigate, useParams } from "react-router-dom"
import type { Mood } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface MoodOption {
  value: Mood
  emoji: string
  label: string
  color: string
}

const MOODS: MoodOption[] = [
  { value: "happy", emoji: "\u{1F60A}", label: "Happy", color: "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800" },
  { value: "curious", emoji: "\u{1F914}", label: "Curious", color: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800" },
  { value: "bored", emoji: "\u{1F610}", label: "Bored", color: "bg-muted hover:bg-muted/80" },
  { value: "stressed", emoji: "\u{1F630}", label: "Stressed", color: "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800" },
]

export default function MoodSelector() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()

  const selectMood = (mood: Mood) => {
    navigate(`/child/${childId}/feed?mood=${mood}`)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">How are you feeling?</h1>
        <p className="text-muted-foreground">Pick your mood for today</p>
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-sm">
        {MOODS.map((m) => (
          <Card
            key={m.value}
            className={`cursor-pointer hover:scale-105 transition-transform ${m.color}`}
            onClick={() => selectMood(m.value)}
          >
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <span className="text-5xl">{m.emoji}</span>
              <p className="font-semibold text-lg">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="link" onClick={() => navigate("/profiles")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Switch Profile
      </Button>
    </div>
  )
}
