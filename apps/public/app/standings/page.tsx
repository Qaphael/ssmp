"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { StandingsTable } from "@/components/standings-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Competition, Team } from "@ssmp/shared-types"

export default function StandingsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCompId, setSelectedCompId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const comps = await apiClient.getCompetitions()
        setCompetitions(comps)
        if (comps.length > 0) {
          setSelectedCompId(comps[0].id)
        }
      } catch (err) {
        setError("Failed to load competitions")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const loadTeams = async () => {
      if (!selectedCompId) return

      try {
        const teamsList = await apiClient.getTeams(selectedCompId)
        setTeams(teamsList)
      } catch (err) {
        setError("Failed to load teams")
        setTeams([])
      }
    }

    loadTeams()
  }, [selectedCompId])

  const standings = teams.map((team) => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }))

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-2">
          STANDINGS
        </h1>
        <p className="text-lg text-muted-foreground">
          League tables and competition standings
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {/* Competition Selector */}
      <div className="mb-6">
        <Select value={selectedCompId} onValueChange={setSelectedCompId}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Select a competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                {comp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Standings Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      ) : standings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {competitions.find((c) => c.id === selectedCompId)?.name || "Standings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StandingsTable standings={standings} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No teams in the selected competition
          </CardContent>
        </Card>
      )}
    </main>
  )
}
