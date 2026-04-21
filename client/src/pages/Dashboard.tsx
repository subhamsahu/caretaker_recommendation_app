/**
 * Parent Dashboard — welcoming overview with per-child stats,
 * learning ratio, top categories, and quick launch into child mode.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getParentDashboard, listChildren } from "@/api/client"
import type { ParentDashboard, Child } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  UserPlus,
  Play,
  Clock,
  BookOpen,
  Tv2,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react"

/** Distinct pastel bg / emoji combos for child avatars */
const CHILD_COLORS = [
  { bg: "bg-violet-100 dark:bg-violet-900/50", text: "text-violet-600 dark:text-violet-300", emoji: "🐱" },
  { bg: "bg-sky-100    dark:bg-sky-900/50",    text: "text-sky-600    dark:text-sky-300",    emoji: "🐼" },
  { bg: "bg-rose-100   dark:bg-rose-900/50",   text: "text-rose-600   dark:text-rose-300",   emoji: "🦊" },
  { bg: "bg-amber-100  dark:bg-amber-900/50",  text: "text-amber-600  dark:text-amber-300",  emoji: "🐸" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-600 dark:text-emerald-300", emoji: "🐧" },
]

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-4 ${color}`}>
      <div className="rounded-xl p-2.5 bg-white/30 dark:bg-black/20 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs opacity-60 truncate">{sub}</p>}
      </div>
    </div>
  )
}

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

  /* ── Loading skeleton ─────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-4 pt-0 max-w-4xl mx-auto w-full">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  /* ── Derived stats ────────────────────────────────── */
  const totalMinutes = dashboard?.children.reduce(
    (s, c) => s + c.total_watch_minutes, 0
  ) ?? 0
  const avgLearning =
    dashboard && dashboard.children.length
      ? Math.round(
          (dashboard.children.reduce((s, c) => s + c.learning_ratio, 0) /
            dashboard.children.length) *
            100
        )
      : 0
  const firstName = dashboard?.parent_username
    ? dashboard.parent_username.split(/[\s@]/)[0]
    : "there"

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl mx-auto w-full">

      {/* ── Welcome header ──────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold capitalize leading-tight">
            {firstName} <span className="text-xl">👋</span>
          </h1>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/add-child")}
          className="shrink-0"
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {/* ── Summary stat strip ──────────────────────── */}
      {children.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Profiles"
            value={children.length}
            color="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Watch Time"
            value={`${totalMinutes}m`}
            sub="total all children"
            color="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Learning"
            value={`${avgLearning}%`}
            sub="avg across kids"
            color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
          />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────── */}
      {children.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-border py-16 text-center">
          <div className="rounded-full bg-muted p-5">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">No children yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a child profile to start personalised recommendations.
            </p>
          </div>
          <Button onClick={() => navigate("/add-child")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add First Child
          </Button>
        </div>
      )}

      {/* ── Child profile cards ─────────────────────── */}
      {children.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Children
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child, idx) => {
              const color = CHILD_COLORS[idx % CHILD_COLORS.length]
              const stats = dashboard?.children.find(
                (d) => d.child_name === child.name
              )
              const learningPct = stats
                ? Math.round(stats.learning_ratio * 100)
                : 0
              const entertainmentPct = stats
                ? Math.round(stats.entertainment_ratio * 100)
                : 0

              return (
                <Card
                  key={child.id}
                  className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card header strip */}
                  <div className={`${color.bg} px-5 pt-5 pb-4`}>
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar */}
                      <div className={`text-4xl leading-none ${color.text}`}>
                        {color.emoji}
                      </div>
                      {/* Name + age */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold leading-tight truncate">
                          {child.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            Age {child.age}
                          </Badge>
                          {child.interests.slice(0, 2).map((i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs px-2 py-0 capitalize bg-white/40 dark:bg-black/20 border-transparent"
                            >
                              {i}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Launch button */}
                      <Button
                        size="sm"
                        onClick={() => navigate(`/child/${child.id}/mood`)}
                        className="shrink-0 rounded-xl"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-5 px-5 space-y-4">
                    {/* Watch time row */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Watch time
                      </span>
                      <span className="font-semibold">
                        {stats?.total_watch_minutes ?? 0} min
                      </span>
                    </div>

                    {/* Learning / Entertainment bars */}
                    {stats && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Learning
                          </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {learningPct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${learningPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Tv2 className="h-3 w-3" /> Entertainment
                          </span>
                          <span className="font-medium text-amber-500 dark:text-amber-400">
                            {entertainmentPct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${entertainmentPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Top categories */}
                    {stats && stats.top_categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {stats.top_categories.slice(0, 4).map((cat) => (
                          <Badge
                            key={cat.category}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 capitalize"
                          >
                            {cat.category}
                            <span className="ml-1 opacity-60">
                              {cat.total_minutes}m
                            </span>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs"
                        onClick={() => navigate(`/child/${child.id}/games`)}
                      >
                        🎮 Games
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs"
                        onClick={() => navigate(`/child/${child.id}/mood`)}
                      >
                        🎬 Videos
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}