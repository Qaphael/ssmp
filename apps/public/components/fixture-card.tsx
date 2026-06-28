"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Match } from "@ssmp/shared-types"
import { formatTime, getMatchStatusColor } from "@/lib/utils"

interface FixtureCardProps {
  match: Match & { homeTeam?: any; awayTeam?: any }
}

export function FixtureCard({ match }: FixtureCardProps) {
  const homeTeam = (match as any).homeTeam
  const awayTeam = (match as any).awayTeam
  const isLive = match.status === "kickoff" || match.status === "half_time" || match.status === "second_half"
  const isCompleted = match.status === "full_time"

  return (
    <Link href={`/matches/${match.id}`} className="block hover:no-underline">
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="space-y-3">
          {/* Header with date and status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTime(match.scheduledAt)}
            </span>
            <Badge
              className={getMatchStatusColor(match.status)}
              variant="outline"
            >
              {match.status === "scheduled" && "Scheduled"}
              {match.status === "kickoff" && "Kickoff"}
              {(match.status === "half_time" || match.status === "second_half") && "Live"}
              {match.status === "full_time" && "Final"}
              {match.status === "abandoned" && "Abandoned"}
            </Badge>
          </div>

          {/* Teams and score */}
          <div className="flex items-center justify-between gap-2">
            {/* Home team */}
            <div className="flex-1 text-center">
              <div className="font-semibold text-sm truncate">
                {homeTeam?.schoolName || "Team A"}
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {isCompleted || isLive ? (
                <>
                  <div className="text-2xl font-bold">
                    {match.homeScore ?? "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {match.awayScore ?? "-"}
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">vs</div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 text-center">
              <div className="font-semibold text-sm truncate">
                {awayTeam?.schoolName || "Team B"}
              </div>
            </div>
          </div>

          {/* Live indicator */}
          {isLive && (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
