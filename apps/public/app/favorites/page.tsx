"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useFavorites } from "@/lib/use-favorites"
import { FavoriteButton } from "@/components/favorite-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import type { Team, Match } from "@ssmp/shared-types"

export default function FavoritesPage() {
  const { favorites, isFavorite } = useFavorites()
  const [teams, setTeams] = useState<Team[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const allTeams = await apiClient.getTeams()
        const favTeams = allTeams.filter((t) => favorites.includes(t.id))
        setTeams(favTeams)

        if (favTeams.length > 0) {
          const matches = await apiClient.getMatches({
            teamId: favTeams[0].id,
          })
          const upcoming = matches.filter(
            (m) => new Date(m.scheduledAt) > new Date() && !["cancelled", "walkover", "published"].includes(m.status)
          )
          setUpcomingMatches(upcoming)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [favorites])

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl flex items-center gap-3">
          <Heart className="h-10 w-10 text-red-500" />
          MY FAVORITES
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your favorite teams and upcoming fixtures
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No favorites yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Browse teams and click the heart icon to add them here
          </p>
          <Link
            href="/competitions"
            className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
          >
            Browse Competitions
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Favorite Teams */}
          <div>
            <h2 className="text-xl font-bold mb-4">Favorite Teams</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">{team.schoolName}</p>
                        </div>
                        <FavoriteButton teamId={team.id} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Fixtures */}
          {upcomingMatches.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Fixtures</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingMatches.slice(0, 6).map((match) => (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-2">
                            {new Date(match.scheduledAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="font-semibold">
                            {(match as any).homeTeam?.name || "Home"} vs {(match as any).awayTeam?.name || "Away"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
