import type {
  Competition,
  Team,
  Player,
  Match,
  Organization,
  Season,
} from "@ssmp/shared-types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export const apiClient = {
  async getCompetitions(): Promise<Competition[]> {
    const res = await fetch(`${API_URL}/api/competitions`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    })
    if (!res.ok) throw new Error("Failed to fetch competitions")
    return res.json()
  },

  async getCompetition(id: string): Promise<Competition> {
    const res = await fetch(`${API_URL}/api/competitions/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch competition")
    return res.json()
  },

  async getTeams(competitionId?: string): Promise<Team[]> {
    const params = new URLSearchParams()
    if (competitionId) params.append("competitionId", competitionId)
    const res = await fetch(`${API_URL}/api/teams?${params}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch teams")
    return res.json()
  },

  async getTeam(id: string): Promise<Team> {
    const res = await fetch(`${API_URL}/api/teams/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch team")
    return res.json()
  },

  async getPlayers(teamId?: string): Promise<Player[]> {
    const params = new URLSearchParams()
    if (teamId) params.append("teamId", teamId)
    const res = await fetch(`${API_URL}/api/players?${params}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error("Failed to fetch players")
    return res.json()
  },

  async getPlayer(id: string): Promise<Player> {
    const res = await fetch(`${API_URL}/api/players/${id}`, {
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

    const res = await fetch(`${API_URL}/api/matches?${searchParams}`, {
      next: { revalidate: 60 }, // ISR: revalidate every minute for live scores
    })
    if (!res.ok) throw new Error("Failed to fetch matches")
    return res.json()
  },

  async getOrganizations(): Promise<Organization[]> {
    const res = await fetch(`${API_URL}/api/organizations`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    })
    if (!res.ok) throw new Error("Failed to fetch organizations")
    return res.json()
  },

  async getSeasons(): Promise<Season[]> {
    const res = await fetch(`${API_URL}/api/seasons`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("Failed to fetch seasons")
    return res.json()
  },
}
