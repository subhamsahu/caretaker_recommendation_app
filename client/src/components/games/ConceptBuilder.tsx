/**
 * ConceptBuilder — drag-and-drop visual learning game.
 *
 * Children drag labelled items into the correct ordered positions.
 * Fully reusable: pass any theme via props.
 *
 * Example (Solar System):
 *   <ConceptBuilder
 *     title="Build the Solar System"
 *     items={[
 *       { id: 'mercury', label: 'Mercury', correctIndex: 0, image: '☿' },
 *       { id: 'venus',   label: 'Venus',   correctIndex: 1, image: '♀' },
 *       { id: 'earth',   label: 'Earth',   correctIndex: 2, image: '🌍' },
 *       { id: 'mars',    label: 'Mars',    correctIndex: 3, image: '🔴' },
 *     ]}
 *     onComplete={() => navigate('/next')}
 *   />
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, RefreshCw, Star, Trophy, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { postConceptBuilderResult } from '@/api/client'

/* ───────────────────────────── Types ───────────────────────────── */

export interface GameItem {
  id: string
  label: string
  /** 0-based position this item belongs in */
  correctIndex: number
  /** emoji character or image URL */
  image?: string
}

export interface VisualTheme {
  wrapperClass: string
  decorations: Array<{ emoji: string; style: React.CSSProperties }>
  itemCardClass: string
  itemTextClass: string
  zoneNumberClass: string
  zoneEmptyClass: string
  poolClass: string
  dropAreaClass: string
  sectionLabelClass: string
  titleClass: string
  subtitleClass: string
  progressFill: string
  progressTrackClass: string
  backBarClass: string
  backButtonClass: string
}

export interface ConceptBuilderProps {
  title: string
  items: GameItem[]
  onComplete: () => void
  visual?: VisualTheme
}

type ZoneFeedback = 'correct' | 'incorrect' | null

/* ─────────────────────────── DraggableItem ─────────────────────── */

interface DraggableItemProps {
  item: GameItem
  isDragging: boolean
  visual?: VisualTheme
  onDragStart: (e: React.DragEvent, item: GameItem) => void
  onDragEnd: () => void
}

function DraggableItem({ item, isDragging, visual, onDragStart, onDragEnd }: DraggableItemProps) {
  const isEmoji = (item.image?.length ?? 0) <= 2
  const cardBase = visual?.itemCardClass ?? 'bg-card border-border'

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className={[
        'flex flex-col items-center justify-center gap-1.5 w-24 h-24',
        'rounded-xl border-2 shadow-sm',
        'cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-150',
        cardBase,
        isDragging
          ? 'scale-110 shadow-xl ring-2 ring-white/30 opacity-80'
          : 'hover:scale-105 hover:shadow-lg hover:brightness-110',
      ].join(' ')}
    >
      {item.image && (
        isEmoji
          ? <span className="text-3xl leading-none">{item.image}</span>
          : <img src={item.image} alt={item.label} className="w-10 h-10 object-contain" />
      )}
      <span className={`text-xs font-semibold text-center leading-tight px-1 break-words ${visual?.itemTextClass ?? ''}`}>
        {item.label}
      </span>
    </div>
  )
}

/* ──────────────────────────── DropZone ─────────────────────────── */

interface DropZoneProps {
  index: number
  placedItem: GameItem | null
  feedback: ZoneFeedback
  isOver: boolean
  visual?: VisualTheme
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
}

function DropZone({
  index,
  placedItem,
  feedback,
  isOver,
  visual,
  onDragOver,
  onDragLeave,
  onDrop,
}: DropZoneProps) {
  const isEmoji = (placedItem?.image?.length ?? 0) <= 2
  const emptyClass = visual?.zoneEmptyClass ?? 'border-dashed border-muted-foreground/30 bg-muted/30'

  const surfaceClass =
    feedback === 'correct'
      ? 'border-green-400 bg-green-400/20'
      : feedback === 'incorrect'
      ? 'border-red-400 bg-red-400/20 animate-[shake_0.35s_ease-in-out]'
      : isOver
      ? 'border-white/70 bg-white/20 scale-105'
      : emptyClass

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${visual?.zoneNumberClass ?? 'text-muted-foreground'}`}>
        #{index + 1}
      </span>

      <div
        onDragOver={(e) => onDragOver(e, index)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, index)}
        className={[
          'relative flex flex-col items-center justify-center gap-1.5',
          'w-24 h-24 rounded-xl border-2 transition-all duration-150',
          surfaceClass,
        ].join(' ')}
      >
        {placedItem ? (
          <>
            {placedItem.image && (
              isEmoji
                ? <span className="text-3xl leading-none">{placedItem.image}</span>
                : <img src={placedItem.image} alt={placedItem.label} className="w-10 h-10 object-contain" />
            )}
            <span className={`text-xs font-semibold text-center leading-tight px-1 ${visual?.itemTextClass ?? ''}`}>
              {placedItem.label}
            </span>

            {feedback === 'correct' && (
              <CheckCircle2 className="absolute -top-2.5 -right-2.5 h-5 w-5 text-green-400 bg-black/60 rounded-full shadow" />
            )}
            {feedback === 'incorrect' && (
              <XCircle className="absolute -top-2.5 -right-2.5 h-5 w-5 text-red-400 bg-black/60 rounded-full shadow" />
            )}
          </>
        ) : (
          <span className="text-3xl leading-none opacity-20">?</span>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────── ResultScreen ───────────────────────── */

interface ResultScreenProps {
  title: string
  totalItems: number
  incorrectAttempts: number
  timeSeconds: number
  visual?: VisualTheme
  onContinue: () => void
  onReset: () => void
}

function ResultScreen({
  title,
  totalItems,
  incorrectAttempts,
  timeSeconds,
  visual,
  onContinue,
  onReset,
}: ResultScreenProps) {
  const starCount =
    incorrectAttempts === 0 ? 3 : incorrectAttempts <= 3 ? 2 : 1

  const formatTime = (s: number) =>
    s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

  const BURST = ['🌟', '✨', '🎉', '🏆', '⭐', '🎊', '✨', '🌟']

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center animate-in fade-in zoom-in duration-300">
      {/* Trophy + orbiting confetti */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {BURST.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-xl animate-bounce"
            style={{
              transform: `rotate(${i * 45}deg) translateX(54px)`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.9s',
            }}
          >
            {emoji}
          </span>
        ))}
        <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
      </div>

      <div className="space-y-1">
        <h2 className={`text-2xl font-bold ${visual?.titleClass ?? ''}`}>Amazing Work! 🎉</h2>
        <p className={`text-sm ${visual?.subtitleClass ?? 'text-muted-foreground'}`}>
          You built: <span className={`font-semibold ${visual?.titleClass ?? 'text-foreground'}`}>{title}</span>
        </p>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <Star
            key={i}
            className={`h-8 w-8 transition-all ${
              i < starCount ? 'text-yellow-400 fill-yellow-400 scale-110' : 'opacity-20'
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { label: 'Items', value: String(totalItems) },
          { label: 'Mistakes', value: String(incorrectAttempts) },
          { label: 'Time', value: formatTime(timeSeconds) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center gap-0.5">
            <span className={`text-lg font-bold leading-tight ${visual?.titleClass ?? ''}`}>{value}</span>
            <span className={`text-[10px] uppercase tracking-wide ${visual?.subtitleClass ?? 'text-muted-foreground'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="bg-white/10 border-white/30 hover:bg-white/20"
          style={{ color: visual?.progressFill ?? undefined }}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Play Again
        </Button>
        <Button
          size="sm"
          onClick={onContinue}
          style={visual?.progressFill ? { backgroundColor: visual.progressFill, borderColor: visual.progressFill, color: '#fff' } : undefined}
        >
          Continue →
        </Button>
      </div>
    </div>
  )
}

/* ──────────────────────── ConceptBuilder ───────────────────────── */

export default function ConceptBuilder({ title, items, onComplete, visual }: ConceptBuilderProps) {
  /** Zones that have been correctly and permanently filled. */
  const [correctSlots, setCorrectSlots] = useState<Record<number, GameItem>>({})
  /** Current visual content of each zone (includes transient incorrect placements). */
  const [tentativeSlots, setTentativeSlots] = useState<Record<number, GameItem>>({})
  /** Per-zone visual feedback state. */
  const [zoneFeedback, setZoneFeedback] = useState<Record<number, ZoneFeedback>>({})
  const [dragOverZone, setDragOverZone] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [incorrectAttempts, setIncorrectAttempts] = useState(0)
  const [completed, setCompleted] = useState(false)

  const startTimeRef = useRef<number>(Date.now())
  const feedbackTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const correctlyPlacedIds = new Set(Object.values(correctSlots).map((i) => i.id))
  const availableItems = items.filter((item) => !correctlyPlacedIds.has(item.id))

  /* ── Drag handlers ── */

  const handleDragStart = useCallback((e: React.DragEvent, item: GameItem) => {
    e.dataTransfer.setData('itemId', item.id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(item.id)
  }, [])

  const handleDragEnd = useCallback(() => setDraggingId(null), [])

  const handleDragOver = useCallback((e: React.DragEvent, zoneIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverZone(zoneIndex)
  }, [])

  const handleDragLeave = useCallback(() => setDragOverZone(null), [])

  const handleDrop = useCallback(
    (e: React.DragEvent, zoneIndex: number) => {
      e.preventDefault()
      setDragOverZone(null)

      const itemId = e.dataTransfer.getData('itemId')
      if (!itemId) return

      const item = items.find((i) => i.id === itemId)
      if (!item) return

      // Zone is already locked with a correct item — ignore
      if (correctSlots[zoneIndex]) return

      // Clear stale timer for this zone
      clearTimeout(feedbackTimers.current[zoneIndex])

      if (item.correctIndex === zoneIndex) {
        // ── Correct placement ──
        setTentativeSlots((prev) => ({ ...prev, [zoneIndex]: item }))
        setZoneFeedback((prev) => ({ ...prev, [zoneIndex]: 'correct' }))
        setCorrectSlots((prev) => {
          const updated = { ...prev, [zoneIndex]: item }
          if (Object.keys(updated).length === items.length) {
            // Small delay so the last "correct" flash is visible before result screen
            setTimeout(() => setCompleted(true), 700)
          }
          return updated
        })
      } else {
        // ── Incorrect placement ──
        setTentativeSlots((prev) => ({ ...prev, [zoneIndex]: item }))
        setZoneFeedback((prev) => ({ ...prev, [zoneIndex]: 'incorrect' }))
        setIncorrectAttempts((c) => c + 1)

        feedbackTimers.current[zoneIndex] = setTimeout(() => {
          setTentativeSlots((prev) => {
            const next = { ...prev }
            // Only clear if this zone is still empty (no correct item placed since)
            if (!correctSlots[zoneIndex]) delete next[zoneIndex]
            return next
          })
          setZoneFeedback((prev) => ({ ...prev, [zoneIndex]: null }))
        }, 850)
      }
    },
    [items, correctSlots],
  )

  /* ── Submit result on completion ── */

  useEffect(() => {
    if (!completed) return
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    postConceptBuilderResult({
      title,
      total_items: items.length,
      incorrect_attempts: incorrectAttempts,
      time_seconds: timeSeconds,
      completed_at: new Date().toISOString(),
    }).catch(() => {
      // Non-critical — UI still works if backend is unavailable
    })
  }, [completed]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Reset ── */

  const handleReset = () => {
    Object.values(feedbackTimers.current).forEach(clearTimeout)
    setCorrectSlots({})
    setTentativeSlots({})
    setZoneFeedback({})
    setDragOverZone(null)
    setDraggingId(null)
    setIncorrectAttempts(0)
    setCompleted(false)
    startTimeRef.current = Date.now()
  }

  /* ── Result screen ── */

  if (completed) {
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-2xl mx-auto w-full">
        <ResultScreen
          title={title}
          totalItems={items.length}
          incorrectAttempts={incorrectAttempts}
          timeSeconds={timeSeconds}
          visual={visual}
          onContinue={onComplete}
          onReset={handleReset}
        />
      </div>
    )
  }

  /* ── Game screen ── */

  const placedCount = Object.keys(correctSlots).length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto w-full select-none">

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className={`text-2xl font-bold ${visual?.titleClass ?? ''}`}>{title}</h1>
        <p className={`text-sm ${visual?.subtitleClass ?? 'text-muted-foreground'}`}>
          Drag each item into the correct position
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className={visual?.subtitleClass ?? 'text-muted-foreground'}>
            {placedCount} / {items.length} placed
          </span>
          {incorrectAttempts > 0 && (
            <span className="text-red-400">
              {incorrectAttempts} mistake{incorrectAttempts !== 1 && 's'}
            </span>
          )}
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${visual?.progressTrackClass ?? 'bg-muted'}`}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(placedCount / items.length) * 100}%`,
              backgroundColor: visual?.progressFill ?? 'hsl(var(--primary))',
            }}
          />
        </div>
      </div>

      {/* Items pool */}
      <section className="flex flex-col gap-2">
        <h2 className={`text-[11px] font-semibold uppercase tracking-widest text-center ${visual?.sectionLabelClass ?? 'text-muted-foreground'}`}>
          Items — drag to place
        </h2>
        <div className={`flex flex-wrap gap-3 justify-center min-h-28 p-4 rounded-xl border border-dashed transition-colors ${visual?.poolClass ?? 'border-muted-foreground/20 bg-muted/20'}`}>
          {availableItems.length === 0 ? (
            <p className={`text-sm self-center italic ${visual?.subtitleClass ?? 'text-muted-foreground'}`}>
              All items placed! 🎉
            </p>
          ) : (
            availableItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                isDragging={draggingId === item.id}
                visual={visual}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </section>

      {/* Drop zones */}
      <section className="flex flex-col gap-2">
        <h2 className={`text-[11px] font-semibold uppercase tracking-widest text-center ${visual?.sectionLabelClass ?? 'text-muted-foreground'}`}>
          Drop here in order
        </h2>
        <div className={`flex flex-wrap gap-4 justify-center p-4 rounded-xl border ${visual?.dropAreaClass ?? 'bg-muted/10 border-border'}`}>
          {Array.from({ length: items.length }, (_, i) => (
            <DropZone
              key={i}
              index={i}
              placedItem={tentativeSlots[i] ?? correctSlots[i] ?? null}
              feedback={zoneFeedback[i] ?? null}
              isOver={dragOverZone === i}
              visual={visual}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </section>

      {/* Reset button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className={`text-xs ${visual?.subtitleClass ?? 'text-muted-foreground'}`}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
