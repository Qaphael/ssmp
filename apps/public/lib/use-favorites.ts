"use client"

import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "ssmp_favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) setFavorites(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = useCallback((next: string[]) => {
    setFavorites(next)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  }, [])

  const toggle = useCallback((teamId: string) => {
    persist(
      favorites.includes(teamId)
        ? favorites.filter((id) => id !== teamId)
        : [...favorites, teamId]
    )
  }, [favorites, persist])

  const isFavorite = useCallback((teamId: string) => favorites.includes(teamId), [favorites])

  return { favorites, toggle, isFavorite }
}
