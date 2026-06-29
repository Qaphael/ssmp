"use client"

import { useEffect, useState } from "react"
import type { MatchEvent } from "@ssmp/shared-types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LiveCommentaryProps {
  matchId: string
  initialEvents?: MatchEvent[]
  isLive?: boolean
}

const EVENT_ICONS: Record<string, string> = {
  goal: "\u26bd",
  own_goal: "\u26bd",
  penalty_scored: "\u26bd",
  penalty_missed: "\u274c",
  yellow_card: "\ud83d\udfe3",
  red_card: "\ud83d\udd34",
  substitution: "\u21c4",
  kickoff: "\u26bd",
  half_time: "\u23f3",
  full_time: "\u23f0",
  extra_time_start: "\u23f3",
  assist: "\ud83d\udc64",
}

const EVENT_LABELS: Record<string, string> = {
  goal: "Goal",
  own_goal: "Own Goal",
  penalty_scored: "Penalty Scored",
  penalty_missed: "Penalty Missed",
  yellow_card: "Yellow Card",
  red_card: "Red Card",
  substitution: "Substitution",
  kickoff: "Kickoff",
  half_time: "Half Time",
  full_time: "Full Time",
  extra_time_start: "Extra Time",
  assist: "Assist",
}

export function LiveCommentary({ matchId, initialEvents = [], isLive = false }: LiveCommentaryProps) {
  const [events, setEvents] = useState<MatchEvent[]>(initialEvents)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/matches/${matchId}/events`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.data || [])
        }
      } catch {}
    }, 10000)

    return () => clearInterval(interval)
  }, [matchId, isLive])

  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Live Commentary
          {isLive && (
            <Badge className="bg-red-100 text-red-800 animate-pulse">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No events recorded yet
          </p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="text-lg leading-none mt-0.5">
                  {EVENT_ICONS[event.type] || "\u2753"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {event.minute}'
                    </Badge>
                    <span className="text-sm font-medium">
                      {EVENT_LABELS[event.type] || event.type}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  {event.playerId && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                      Player: {event.playerId.substring(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
