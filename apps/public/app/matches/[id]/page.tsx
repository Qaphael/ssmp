import { apiClient } from "@/lib/api-client"
import { LiveCommentary } from "@/components/live-commentary"
import { CalendarExportButton } from "@/components/calendar-export"
import { FavoriteButton } from "@/components/favorite-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface MatchDetailPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: MatchDetailPageProps) {
  try {
    const match = await apiClient.getMatch(params.id)
    return {
      title: `Match - SSMP`,
      description: `Match details and live commentary`,
    }
  } catch {
    return { title: "Match - SSMP" }
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  let match: any = null
  let events: any[] = []
  let error: string | null = null

  try {
    match = await apiClient.getMatch(params.id)
    events = await apiClient.getMatchEvents(params.id)
  } catch (err) {
    error = "Failed to load match details"
  }

  if (!match) {
    return (
      <main className="container max-w-screen-2xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error || "Match not found"}
        </div>
      </main>
    )
  }

  const homeTeam = (match as any).homeTeam || { name: match.home_team_name || "Home Team" }
  const awayTeam = (match as any).awayTeam || { name: match.away_team_name || "Away Team" }
  const isLive = ["kickoff", "half_time", "second_half", "extra_time", "penalties"].includes(match.status)
  const isCompleted = ["full_time", "published", "verified"].includes(match.status)

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/competitions" className="hover:text-foreground">Competitions</Link>
          <span>/</span>
          <span>Match</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Match Details
            </h1>
            <p className="mt-2 text-muted-foreground">
              Matchday {match.matchday || "?"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarExportButton match={match} />
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {/* Home */}
            <div className="flex-1 text-center">
              <div className="text-lg md:text-xl font-bold">{homeTeam.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{homeTeam.schoolName}</div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {isCompleted || isLive ? (
                <div className="text-4xl md:text-5xl font-bold tabular-nums">
                  {match.homeScore ?? 0}
                  <span className="text-muted-foreground mx-1">-</span>
                  {match.awayScore ?? 0}
                </div>
              ) : (
                <div className="text-2xl text-muted-foreground">vs</div>
              )}
              <Badge
                className={`mt-2 ${isLive ? "bg-red-100 text-red-800 animate-pulse" : isCompleted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                variant="outline"
              >
                {match.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>

            {/* Away */}
            <div className="flex-1 text-center">
              <div className="text-lg md:text-xl font-bold">{awayTeam.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{awayTeam.schoolName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Commentary */}
      <LiveCommentary
        matchId={params.id}
        initialEvents={events}
        isLive={isLive}
      />
    </main>
  )
}
