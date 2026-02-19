/**
 * Recommendation feed — shows videos recommended for the child + mood.
 */

import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getRecommendations, likeVideo } from "@/api/client"
import type { Video } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Play, ArrowLeft } from "lucide-react"

export default function RecommendationFeed() {
  const { childId } = useParams<{ childId: string }>()
  const [searchParams] = useSearchParams()
  const mood = searchParams.get("mood") || "happy"
  const navigate = useNavigate()

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    getRecommendations(Number(childId), mood)
      .then(setVideos)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [childId, mood])

  const handleLike = async (videoId: number) => {
    try {
      await likeVideo(videoId, Number(childId))
      setLikedIds((prev) => new Set(prev).add(videoId))
    } catch {
      // already liked or error
    }
  }

  const handleWatch = (video: Video) => {
    navigate(
      `/child/${childId}/watch?videoId=${video.id}&url=${encodeURIComponent(
        video.url
      )}&title=${encodeURIComponent(video.title)}`
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Videos for you — {mood}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/child/${childId}/mood`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Mood
        </Button>
      </div>

      {videos.length === 0 && (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">
              No videos found for this mood. Try a different one!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit text-xs uppercase">
                {video.category}
              </Badge>
              <CardTitle className="text-base mt-1">{video.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>🎓 Edu: {(video.education_score * 100).toFixed(0)}%</span>
                <span>🛡️ Safe: {(video.safety_score * 100).toFixed(0)}%</span>
                {video.relevance_score !== undefined && (
                  <span>⭐ Score: {video.relevance_score.toFixed(2)}</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => handleWatch(video)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch
                </Button>
                <Button
                  variant={likedIds.has(video.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLike(video.id)}
                  disabled={likedIds.has(video.id)}
                  className={likedIds.has(video.id) ? "bg-pink-500 hover:bg-pink-500" : ""}
                >
                  <Heart
                    className={`h-4 w-4 ${likedIds.has(video.id) ? "fill-white" : ""}`}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
