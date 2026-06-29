import { apiClient } from "@/lib/api-client"
import { FixtureCard } from "@/components/fixture-card"
import { StandingsTable } from "@/components/standings-table"
import { MediaGallery } from "@/components/media-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface CompetitionDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: CompetitionDetailPageProps) {
  try {
    const competition = await apiClient.getCompetition(params.id)
    return {
      title: `${competition.name} - SSMP`,
      description: `View standings, fixtures, and details for ${competition.name}`,
    }
  } catch {
    return {
      title: "Competition - SSMP",
    }
  }
}

export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailPageProps) {
  let competition: any = null
  let matches: any[] = []
  let teams: any[] = []
  let media: any[] = []
  let error: string | null = null

  try {
    competition = await apiClient.getCompetition(params.id)
    teams = await apiClient.getTeams(params.id)
    matches = await apiClient.getMatches({ competitionId: params.id })
    media = await apiClient.getMedia({ competitionId: params.id })
  } catch (err) {
    error = "Failed to load competition details"
  }

  if (!competition) {
    return (
      <main className="container max-w-screen-2xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error || "Competition not found"}
        </div>
      </main>
    )
  }

  // Build standings from teams
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {competition.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {competition.sport} • {competition.division}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          {competition.enableGroups && (
            <TabsTrigger value="groups">Groups</TabsTrigger>
          )}
          {competition.enableKnockouts && (
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
          )}
        </TabsList>

        {/* Standings Tab */}
        <TabsContent value="standings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Final Standings</CardTitle>
            </CardHeader>
            <CardContent>
              {standings.length > 0 ? (
                <StandingsTable standings={standings} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No teams in this competition yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="mt-6">
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
                  No fixtures scheduled for this competition
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="mt-6">
          <MediaGallery media={media} />
        </TabsContent>

        {/* Groups Tab */}
        {competition.enableGroups && (
          <TabsContent value="groups" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Group information coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Bracket Tab */}
        {competition.enableKnockouts && (
          <TabsContent value="bracket" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Knockout bracket coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </main>
  )
}
