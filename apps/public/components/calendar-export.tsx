"use client"

import { Calendar } from "lucide-react"
import { downloadICal, matchToCalendarEvent } from "@/lib/calendar-export"
import { cn } from "@/lib/utils"

interface CalendarExportButtonProps {
  match: any
  className?: string
}

export function CalendarExportButton({ match, className }: CalendarExportButtonProps) {
  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const event = matchToCalendarEvent(match)
    const homeName = match.homeTeam?.name || match.home_team_name || "Home"
    const awayName = match.awayTeam?.name || match.away_team_name || "Away"
    downloadICal(`${homeName}-vs-${awayName}.ics`, [event])
  }

  return (
    <button
      onClick={handleExport}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors hover:bg-muted",
        className
      )}
      title="Export to calendar"
    >
      <Calendar className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Export</span>
    </button>
  )
}

interface CalendarExportAllProps {
  matches: any[]
  filename?: string
  className?: string
}

export function CalendarExportAll({ matches, filename = "ssmp-fixtures.ics", className }: CalendarExportAllProps) {
  const handleExport = () => {
    const events = matches.map(matchToCalendarEvent)
    downloadICal(filename, events)
  }

  return (
    <button
      onClick={handleExport}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted",
        className
      )}
    >
      <Calendar className="h-4 w-4" />
      Export All Fixtures
    </button>
  )
}
