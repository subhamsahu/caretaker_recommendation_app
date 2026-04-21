/**
 * GamePlay — loads a ConceptBuilder theme by ID and renders the game.
 *
 * Routes:
 *   /games/:gameId               – parent / general access
 *   /child/:childId/game/:gameId – child-scoped access
 */

import { useNavigate, useParams } from 'react-router-dom'
import { GAME_THEMES } from '@/components/games/gameThemes'
import ConceptBuilder from '@/components/games/ConceptBuilder'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function GamePlay() {
  const navigate = useNavigate()
  const { gameId, childId } = useParams<{ gameId: string; childId?: string }>()

  const theme = GAME_THEMES.find((t) => t.id === gameId)

  const backPath = childId ? `/child/${childId}/games` : '/games'

  if (!theme) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🎮</span>
        <h2 className="text-xl font-bold">Game not found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn't find a game with that ID.
        </p>
        <Button onClick={() => navigate(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
      </div>
    )
  }

  const { visual } = theme

  const handleComplete = () => navigate(backPath)

  return (
    <div className={`flex flex-1 flex-col min-h-0 relative overflow-hidden ${visual.wrapperClass}`}>
      {/* Decorative background layer */}
      {visual.decorations.map((d, i) => (
        <span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ ...d.style, zIndex: 0 }}
        >
          {d.emoji}
        </span>
      ))}

      {/* Back bar */}
      <div className={`relative z-10 flex items-center gap-2 px-4 py-2 border-b shrink-0 ${visual.backBarClass}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backPath)}
          className={`${visual.backButtonClass} hover:bg-white/10`}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Games
        </Button>
        <span className={`text-sm opacity-40 ${visual.backButtonClass}`}>/</span>
        <span className={`text-sm font-medium truncate ${visual.titleClass}`}>{theme.title}</span>
      </div>

      {/* Game — sits on top of decorations */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
        <ConceptBuilder
          title={theme.title}
          items={theme.items}
          visual={visual}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
