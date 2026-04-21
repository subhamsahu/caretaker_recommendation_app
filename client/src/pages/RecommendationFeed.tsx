/**
 * Recommendation feed — YouTube-style video grid.
 */

import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getRecommendations, likeVideo } from "@/api/client"
import type { Video } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Play, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const MOOD_FILTERS = [
  { value: "all",      label: "All" },
  { value: "happy",    label: "😊 Happy" },
  { value: "curious",  label: "🤔 Curious" },
  { value: "bored",    label: "😴 Bored" },
  { value: "stressed", label: "😤 Stressed" },
]

const CATEGORY_COLORS: Record<string, string> = {
  science: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  art:     "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  sports:  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  coding:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  music:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  nature:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  math:    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  fun:     "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

/** Extract YouTube video ID from a watch or youtu.be URL */
function getYouTubeId(url: string): string | null {
  if (url.includes("youtube.com/watch?v=")) {
    try { return new URL(url).searchParams.get("v") } catch { return null }
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] ?? null
  }
  return null
}

function getThumbnail(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ""
}

export default function RecommendationFeed() {
  const { childId } = useParams<{ childId: string }>()
  const [searchParams] = useSearchParams()
  const initialMood = searchParams.get("mood") || "happy"
  const navigate = useNavigate()

  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [activeMood, setActiveMood] = useState<string>(initialMood)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    getRecommendations(Number(childId), initialMood)
      .then(setAllVideos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [childId, initialMood])

  const categories = ["all", ...Array.from(new Set(allVideos.map((v) => v.category)))]

  const filtered = allVideos.filter((v) => {
    const moodMatch = activeMood === "all" || v.mood_type === activeMood
    const catMatch  = activeCategory === "all" || v.category === activeCategory
    return moodMatch && catMatch
  })

  const handleLike = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation()
    try {
      await likeVideo(videoId, Number(childId))
      setLikedIds((prev) => new Set(prev).add(videoId))
    } catch { /* already liked */ }
  }

  const handleWatch = (video: Video) => {
    navigate(
      `/child/${childId}/watch?videoId=${video.id}&url=${encodeURIComponent(video.url)}&title=${encodeURIComponent(video.title)}`
    )
  }

  // ── Skeleton loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-0 min-h-0">

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 space-y-2">
        {/* Mood chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => navigate(`/child/${childId}/mood`)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0 mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Mood
          </button>
          {MOOD_FILTERS.map((m) => (
            <button
              key={m.value}
              onClick={() => setActiveMood(m.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                activeMood === m.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {cat === "all" ? "All categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <span className="text-4xl">🎬</span>
            <p className="text-sm">No videos match these filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {filtered.map((video) => {
              const thumb = getThumbnail(video.url)
              const liked = likedIds.has(video.id)
              const catColor = CATEGORY_COLORS[video.category] ?? "bg-gray-100 text-gray-700"

              return (
                <div
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => handleWatch(video)}
                  onMouseEnter={() => setHoveredId(video.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Play className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    {/* Play overlay on hover */}
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
                      hoveredId === video.id ? "opacity-100" : "opacity-0"
                    )}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Play className="h-6 w-6 text-black fill-black" />
                      </div>
                    </div>

                    {/* Like button */}
                    <button
                      onClick={(e) => handleLike(e, video.id)}
                      disabled={liked}
                      className={cn(
                        "absolute top-2 right-2 rounded-full p-1.5 transition-all shadow",
                        liked
                          ? "bg-pink-500 text-white"
                          : "bg-black/50 text-white hover:bg-pink-500",
                        hoveredId === video.id || liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", liked && "fill-white")} />
                    </button>

                    {/* Safety badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        🛡️ {(video.safety_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Info row below thumbnail */}
                  <div className="mt-3 flex gap-3">
                    {/* Channel avatar — coloured circle with first letter */}
                    <div className="shrink-0 h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {video.category[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                        {video.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded capitalize", catColor)}>
                          {video.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          🎓 {(video.education_score * 100).toFixed(0)}% educational
                        </span>
                      </div>
                      {video.relevance_score !== undefined && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ⭐ Relevance {video.relevance_score.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
