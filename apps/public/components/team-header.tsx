"use client"

import { FavoriteButton } from "@/components/favorite-button"

interface TeamHeaderProps {
  team: {
    id: string
    schoolName: string
    shortName?: string
    primaryColor?: string
  }
}

export function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div
      className="mb-8 rounded-lg p-8 text-white"
      style={{ backgroundColor: team.primaryColor || "#1f2937" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {team.schoolName}
          </h1>
          {team.shortName && (
            <p className="mt-2 text-lg opacity-90">{team.shortName}</p>
          )}
        </div>
        <FavoriteButton teamId={team.id} size="lg" className="text-white hover:bg-white/20" />
      </div>
    </div>
  )
}
