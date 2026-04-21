/**
 * Video player page — YouTube-style layout with related videos sidebar.
 */

import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { watchVideo, getRecommendations, likeVideo } from "@/api/client"
import type { Video } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ExternalLink, AlertCircle, ThumbsUp, Play } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function VideoPlayer() {
  const { childId } = useParams<{ childId: string }>()
  const [searchParams] = useSearchParams()
  const videoId  = searchParams.get("videoId")
  const url      = searchParams.get("url") || ""
  const title    = searchParams.get("title") || "Video"
  const navigate = useNavigate()

  const startTime    = useRef(Date.now())
  const [saved, setSaved]           = useState(false)
  const [liked, setLiked]           = useState(false)
  const [embedError, setEmbedError] = useState(false)
  const [related, setRelated]       = useState<Video[]>([])
  const [relLoading, setRelLoading] = useState(true)

  // Detect YouTube iframe errors via postMessage
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return
      try {
        const data = JSON.parse(typeof event.data === "string" ? event.data : JSON.stringify(event.data))
        if (data?.event === "infoDelivery" && data?.info?.error) setEmbedError(true)
      } catch { /* ignore */ }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Load related videos (same child, mixed moods)
  useEffect(() => {
    if (!childId) return
    setRelLoading(true)
    getRecommendations(Number(childId), "happy")
      .then((vids) => setRelated(vids.filter((v) => String(v.id) !== videoId)))
      .catch(() => {})
      .finally(() => setRelLoading(false))
  }, [childId, videoId])

  const recordWatch = async () => {
    if (saved) return
    const minutes = Math.max(1, Math.round((Date.now() - startTime.current) / 60000))
    try {
      await watchVideo(Number(videoId), Number(childId), minutes)
      setSaved(true)
    } catch { /* best-effort */ }
  }

  useEffect(() => {
    return () => { recordWatch() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBack = async () => {
    await recordWatch()
    navigate(-1)
  }

  const handleLike = async () => {
    if (liked) return
    try {
      await likeVideo(Number(videoId), Number(childId))
      setLiked(true)
    } catch { /* already liked */ }
  }

  const handleWatchRelated = async (video: Video) => {
    await recordWatch()
    setSaved(false)
    startTime.current = Date.now()
    navigate(
      `/child/${childId}/watch?videoId=${video.id}&url=${encodeURIComponent(video.url)}&title=${encodeURIComponent(video.title)}`,
      { replace: true }
    )
  }

  const ytId     = getYouTubeId(url)
  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`
    : ""

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">

      {/* ── Thin top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/95 backdrop-blur shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-muted-foreground/40">|</span>
        <p className="text-sm font-medium truncate">{title}</p>
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: player + info */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto px-4 py-4 space-y-4">

            {/* Player */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
              {embedUrl && !embedError ? (
                <iframe
                  key={videoId}
                  src={embedUrl}
                  title={title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
                  {embedError && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <AlertCircle className="h-5 w-5" />
                      Playback unavailable in embedded view.
                    </div>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Watch on YouTube
                  </a>
                </div>
              )}
            </div>

            {/* Title row */}
            <div>
              <h1 className="text-lg font-bold leading-snug">{title}</h1>
            </div>

            {/* Meta + actions row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
              {/* Channel-style info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  K
                </div>
                <div>
                  <p className="text-sm font-semibold">KidCare Picks</p>
                  <p className="text-xs text-muted-foreground">Educational content for kids</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Like */}
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    liked
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-muted hover:bg-muted/70 border-transparent"
                  )}
                >
                  <ThumbsUp className={cn("h-4 w-4", liked && "fill-white")} />
                  {liked ? "Liked" : "Like"}
                </button>

                {/* Watch on YouTube */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-muted hover:bg-muted/70 border border-transparent transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  YouTube
                </a>
              </div>
            </div>

            {/* Info card */}
            <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm space-y-1">
              <p className="font-semibold text-foreground">About this video</p>
              <p className="text-muted-foreground">
                This video is curated by KidCare based on your child's interests and current mood.
              </p>
            </div>

          </div>
        </div>

        {/* Right: Up Next sidebar */}
        <div className="hidden lg:flex flex-col w-[360px] xl:w-[400px] shrink-0 border-l overflow-y-auto">
          <div className="px-4 pt-4 pb-2 shrink-0">
            <p className="text-sm font-semibold">Up next</p>
          </div>

          <div className="flex-1 px-3 pb-4 space-y-3">
            {relLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="w-[168px] aspect-video rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-0.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : related.map((video) => {
                  const thumb    = getThumbnail(video.url)
                  const catColor = CATEGORY_COLORS[video.category] ?? "bg-gray-100 text-gray-700"
                  return (
                    <div
                      key={video.id}
                      onClick={() => handleWatchRelated(video)}
                      className="flex gap-2 cursor-pointer rounded-lg hover:bg-muted/60 p-1 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-[168px] aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                        <p className="text-xs font-semibold line-clamp-2 leading-snug">
                          {video.title}
                        </p>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded capitalize inline-block", catColor)}>
                          {video.category}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          🎓 {(video.education_score * 100).toFixed(0)}% · 🛡️ {(video.safety_score * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>
    </div>
  )
}
