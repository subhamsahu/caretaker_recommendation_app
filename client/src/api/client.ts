/**
 * Axios instance and API helper functions.
 * All calls go through the Vite proxy (/api → localhost:8000).
 */

import axios from 'axios'
import type { Token, Child, Video, ParentDashboard } from '@/types'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* -------------------- Auth -------------------- */

export const registerUser = async (
  email: string,
  username: string,
  password: string
): Promise<Token> => {
  const { data } = await api.post<Token>('/auth/register', {
    email,
    username,
    password,
  })
  return data
}

export const loginUser = async (
  email: string,
  password: string
): Promise<Token> => {
  const { data } = await api.post<Token>('/auth/login', { email, password })
  return data
}

/* -------------------- Children -------------------- */

export const createChild = async (payload: {
  name: string
  age: number
  interests: string[]
  screen_time_limit: number
}): Promise<Child> => {
  const { data } = await api.post<Child>('/children/', payload)
  return data
}

export const listChildren = async (): Promise<Child[]> => {
  const { data } = await api.get<Child[]>('/children/')
  return data
}

export const getChild = async (id: number): Promise<Child> => {
  const { data } = await api.get<Child>(`/children/${id}`)
  return data
}

/* -------------------- Videos -------------------- */

export const getRecommendations = async (
  childId: number,
  mood: string
): Promise<Video[]> => {
  const { data } = await api.get<Video[]>(
    `/videos/recommend/${childId}?mood=${mood}`
  )
  return data
}

export const likeVideo = async (
  videoId: number,
  childId: number
): Promise<void> => {
  await api.post(`/videos/${videoId}/like?child_id=${childId}`)
}

export const watchVideo = async (
  videoId: number,
  childId: number,
  durationMinutes: number
): Promise<void> => {
  await api.post(`/videos/${videoId}/watch?child_id=${childId}`, {
    duration_minutes: durationMinutes,
  })
}

/* -------------------- Dashboard -------------------- */

export const getParentDashboard = async (): Promise<ParentDashboard> => {
  const { data } = await api.get<ParentDashboard>('/parent/dashboard')
  return data
}

export default api
