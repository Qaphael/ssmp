interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  startTime: string
  endTime?: string
}

function escapeIcal(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function toIcalDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@ssmp.local`
}

export function generateICal(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SSMP//School Sports Management//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]

  for (const event of events) {
    const dtStart = toIcalDate(event.startTime)
    const dtEnd = event.endTime
      ? toIcalDate(event.endTime)
      : toIcalDate(new Date(new Date(event.startTime).getTime() + 2 * 60 * 60 * 1000).toISOString())

    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${event.id || generateUID()}`)
    lines.push(`DTSTART:${dtStart}`)
    lines.push(`DTEND:${dtEnd}`)
    lines.push(`SUMMARY:${escapeIcal(event.title)}`)
    if (event.description) lines.push(`DESCRIPTION:${escapeIcal(event.description)}`)
    if (event.location) lines.push(`LOCATION:${escapeIcal(event.location)}`)
    lines.push(`DTSTAMP:${toIcalDate(new Date().toISOString())}`)
    lines.push("END:VEVENT")
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

export function downloadICal(filename: string, events: CalendarEvent[]) {
  const ical = generateICal(events)
  const blob = new Blob([ical], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function matchToCalendarEvent(match: any): CalendarEvent {
  const homeName = match.homeTeam?.name || match.home_team_name || "Home Team"
  const awayName = match.awayTeam?.name || match.away_team_name || "Away Team"
  return {
    id: match.id,
    title: `${homeName} vs ${awayName}`,
    description: `Matchday ${match.matchday || "?"} - ${match.competitionName || "Competition"}`,
    location: match.pitchName || undefined,
    startTime: match.scheduledAt || match.scheduled_at,
  }
}
