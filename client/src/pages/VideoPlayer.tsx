/**
 * Video player page — embeds the video and records watch time on exit.
 */

import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { watchVideo } from "@/api/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function VideoPlayer() {
  const { childId } = useParams<{ childId: string }>()
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get("videoId")
  const url = searchParams.get("url") || ""
  const title = searchParams.get("title") || "Video"
  const navigate = useNavigate()

  const startTime = useRef(Date.now())
  const [saved, setSaved] = useState(false)

  const recordWatch = async () => {
    if (saved) return
    const minutes = Math.max(
      1,
      Math.round((Date.now() - startTime.current) / 60000)
    )
    try {
      await watchVideo(Number(videoId), Number(childId), minutes)
      setSaved(true)
    } catch {
      // best-effort
    }
  }

  useEffect(() => {
    return () => {
      recordWatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBack = async () => {
    await recordWatch()
    navigate(-1)
  }

  // Build YouTube embed URL
  const embedUrl = url.includes("youtube.com/watch?v=")
    ? url.replace("watch?v=", "embed/")
    : url.includes("youtu.be/")
      ? `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`
      : ""

  return (
    <div className="flex flex-1 flex-col bg-black min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-background/80 backdrop-blur px-4 py-2 border-b">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-sm font-semibold truncate max-w-md">{title}</h1>
        <div className="w-20" />
      </div>

      {/* Player area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full max-w-3xl aspect-video rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-center text-white">
            <p className="text-lg mb-4">🎬 {title}</p>
            <Button asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Video
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
