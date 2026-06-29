"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/use-favorites"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  teamId: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteButton({ teamId, className, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(teamId)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(teamId)
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted",
        className
      )}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          "transition-colors",
          active ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"
        )}
      />
    </button>
  )
}
