/* ---------------------------------------------------
 * Shared TypeScript types mirroring server schemas.
 * ------------------------------------------------- */

export interface Token {
  access_token: string
  token_type: string
}

export interface Child {
  id: number
  name: string
  age: number
  interests: string[]
  screen_time_limit: number
  created_at: string
}

export interface Video {
  id: number
  title: string
  url: string
  category: string
  mood_type: string
  min_age: number
  max_age: number
  education_score: number
  safety_score: number
  relevance_score?: number
}

export interface CategoryStat {
  category: string
  total_minutes: number
}

export interface ChildDashboard {
  child_name: string
  total_watch_minutes: number
  learning_ratio: number
  entertainment_ratio: number
  top_categories: CategoryStat[]
}

export interface ParentDashboard {
  parent_username: string
  children: ChildDashboard[]
}

export type Mood = 'happy' | 'curious' | 'bored' | 'stressed'
