/**
 * Games Hub — shows all available ConceptBuilder learning games.
 * Accessible from the sidebar (parent view) and from the child flow.
 *
 * URL: /games                      – parent / general access
 * URL: /child/:childId/games       – child-scoped access (passes childId to GamePlay)
 */

import { useNavigate, useParams } from 'react-router-dom'
import { GAME_THEMES } from '@/components/games/gameThemes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Gamepad2 } from 'lucide-react'

export default function GamesHub() {
  const navigate = useNavigate()
  const { childId } = useParams<{ childId?: string }>()

  const playPath = (gameId: string) =>
    childId
      ? `/child/${childId}/game/${gameId}`
      : `/games/${gameId}`

  const backPath = childId ? `/child/${childId}/mood` : '/dashboard'

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            Learning Games
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag-and-drop games to make learning fun!
          </p>
        </div>
      </div>

      {/* Game cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_THEMES.map((theme) => (
          <Card
            key={theme.id}
            className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-150 group"
            onClick={() => navigate(playPath(theme.id))}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-4xl leading-none">{theme.emoji}</span>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Age {theme.minAge}+
                </Badge>
              </div>
              <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                {theme.title}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {theme.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {theme.items.length} items to place
                </span>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Play →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
