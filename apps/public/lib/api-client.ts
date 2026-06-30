import type {
  Competition,
  Team,
  Player,
  Match,
  MatchEvent,
  Organization,
  Season,
  Media,
} from "@ssmp/shared-types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export const apiClient = {
  async getCompetitions(): Promise<Competition[]> {
    const res = await fetch(`${API_URL}/api/public/competitions`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    })
    if (!res.ok) throw new Error("Failed to fetch competitions")
    return res.json()
  },

  async getCompetition(id: string): Promise<Competition> {
    const res = await fetch(`${API_URL}/api/public/competitions/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch competition")
    return res.json()
  },

  async getTeams(competitionId?: string): Promise<Team[]> {
    const params = new URLSearchParams()
    if (competitionId) params.append("competitionId", competitionId)
    const res = await fetch(`${API_URL}/api/public/teams?${params}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch teams")
    return res.json()
  },

  async getTeam(id: string): Promise<Team> {
    const res = await fetch(`${API_URL}/api/public/teams/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch team")
    return res.json()
  },

  async getPlayers(teamId?: string): Promise<Player[]> {
    const params = new URLSearchParams()
    if (teamId) params.append("teamId", teamId)
    const res = await fetch(`${API_URL}/api/public/players?${params}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch players")
    return res.json()
  },

  async getPlayer(id: string): Promise<Player> {
    const res = await fetch(`${API_URL}/api/public/players/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch player")
    return res.json()
  },

  async getMatches(params?: {
    dateFrom?: string
    dateTo?: string
    status?: string
    teamId?: string
    competitionId?: string
  }): Promise<Match[]> {
    const searchParams = new URLSearchParams()
    if (params?.dateFrom) searchParams.append("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.append("dateTo", params.dateTo)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.teamId) searchParams.append("teamId", params.teamId)
    if (params?.competitionId) searchParams.append("competitionId", params.competitionId)

    const res = await fetch(`${API_URL}/api/public/matches?${searchParams}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error("Failed to fetch matches")
    return res.json()
  },

  async getMatch(id: string): Promise<Match> {
    const res = await fetch(`${API_URL}/api/public/matches/${id}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) throw new Error("Failed to fetch match")
    return res.json()
  },

  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    const res = await fetch(`${API_URL}/api/public/matches/${matchId}/events`, {
      next: { revalidate: 10 },
    })
    if (!res.ok) throw new Error("Failed to fetch match events")
    const data = await res.json()
    return data.data || []
  },

  async getOrganizations(): Promise<Organization[]> {
    const res = await fetch(`${API_URL}/api/public/organizations`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    })
    if (!res.ok) throw new Error("Failed to fetch organizations")
    return res.json()
  },

  async getSeasons(): Promise<Season[]> {
    const res = await fetch(`${API_URL}/api/public/seasons`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("Failed to fetch seasons")
    return res.json()
  },

  async getMedia(filters?: {
    competitionId?: string
    matchId?: string
    teamId?: string
    type?: string
  }): Promise<Media[]> {
    const params = new URLSearchParams()
    if (filters?.competitionId) params.append("competitionId", filters.competitionId)
    if (filters?.matchId) params.append("matchId", filters.matchId)
    if (filters?.teamId) params.append("teamId", filters.teamId)
    if (filters?.type) params.append("type", filters.type)
    params.append("isApproved", "true")
    const qs = params.toString()
    const res = await fetch(`${API_URL}/api/public/media?${qs}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch media")
    const data = await res.json()
    return data.data || []
  },

  async getStandings(competitionId: string): Promise<Array<{
    team: Team
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
  }>> {
    const res = await fetch(`${API_URL}/api/public/standings/${competitionId}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error("Failed to fetch standings")
    return res.json()
  },
}
