import { apiClient } from "@/lib/api-client"
import { FixtureCard } from "@/components/fixture-card"
import { TeamHeader } from "@/components/team-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface TeamDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: TeamDetailPageProps) {
  try {
    const team = await apiClient.getTeam(params.id)
    return {
      title: `${team.schoolName} - SSMP`,
      description: `View team profile, roster, and results for ${team.schoolName}`,
    }
  } catch {
    return {
      title: "Team - SSMP",
    }
  }
}

export default async function TeamDetailPage({
  params,
}: TeamDetailPageProps) {
  let team: any = null
  let players: any[] = []
  let matches: any[] = []
  let error: string | null = null

  try {
    team = await apiClient.getTeam(params.id)
    players = await apiClient.getPlayers(params.id)
    matches = await apiClient.getMatches({ teamId: params.id })
  } catch (err) {
    error = "Failed to load team details"
  }

  if (!team) {
    return (
      <main className="container max-w-screen-2xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error || "Team not found"}
        </div>
      </main>
    )
  }

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      {/* Hero Section */}
      <TeamHeader team={team} />

      {/* Tabs */}
      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Roster Tab */}
        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {players
                    .sort((a, b) => (a.jerseyNumber || 0) - (b.jerseyNumber || 0))
                    .map((player) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className="group"
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="pt-4">
                            <div className="text-center space-y-2">
                              <div className="text-2xl font-bold text-muted-foreground">
                                #{player.jerseyNumber || "—"}
                              </div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {player.firstName} {player.lastName}
                              </h3>
                              <Badge variant="outline">
                                {player.position}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No players in this team yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-6">
          <div className="space-y-4">
            {matches.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((match) => (
                  <FixtureCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No matches played yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Matches Played</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{matches.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{players.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {matches.reduce((sum, m) => {
                    if (m.homeTeamId === params.id) return sum + (m.homeScore || 0)
                    if (m.awayTeamId === params.id) return sum + (m.awayScore || 0)
                    return sum
                  }, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {matches.filter((m) => {
                    if (m.homeTeamId === params.id) return (m.homeScore || 0) > (m.awayScore || 0)
                    if (m.awayTeamId === params.id) return (m.awayScore || 0) > (m.homeScore || 0)
                    return false
                  }).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
