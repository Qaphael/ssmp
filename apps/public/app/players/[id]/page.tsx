import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getPlayerStatusColor } from "@/lib/utils"

interface PlayerDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PlayerDetailPageProps) {
  try {
    const player = await apiClient.getPlayer(params.id)
    return {
      title: `${player.firstName} ${player.lastName} - SSMP`,
      description: `View player profile and stats for ${player.firstName} ${player.lastName}`,
    }
  } catch {
    return {
      title: "Player - SSMP",
    }
  }
}

export default async function PlayerDetailPage({
  params,
}: PlayerDetailPageProps) {
  let player: any = null
  let team: any = null
  let error: string | null = null

  try {
    player = await apiClient.getPlayer(params.id)
    if (player.teamId) {
      team = await apiClient.getTeam(player.teamId)
    }
  } catch (err) {
    error = "Failed to load player details"
  }

  if (!player) {
    return (
      <main className="container max-w-screen-2xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error || "Player not found"}
        </div>
      </main>
    )
  }

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Player Card */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="h-48 w-full"
                style={{ backgroundColor: team?.primaryColor || "#e5e7eb" }}
              />
              <div className="p-6 text-center">
                <div className="text-5xl font-bold text-muted-foreground mb-4">
                  #{player.jerseyNumber || "—"}
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {player.firstName} {player.lastName}
                </h1>
                {team && (
                  <Link
                    href={`/teams/${team.id}`}
                    className="text-primary hover:underline mb-4 block"
                  >
                    {team.schoolName}
                  </Link>
                )}
                <Badge className={getPlayerStatusColor(player.status)}>
                  {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">STATS</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{player.gamesPlayed || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{player.goals || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Assists</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{player.assists || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{player.minutesPlayed || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Yellow Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{player.yellowCards || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Red Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{player.redCards || 0}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h2 className="text-2xl font-bold mb-4">INFORMATION</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-semibold text-lg capitalize">
                      {player.position}
                    </p>
                  </div>
                  {player.dateOfBirth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-semibold text-lg">
                        {new Date(player.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {player.height && (
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p className="font-semibold text-lg">{player.height} cm</p>
                    </div>
                  )}
                  {player.weight && (
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-semibold text-lg">{player.weight} kg</p>
                    </div>
                  )}
                  {player.nationality && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-semibold text-lg">{player.nationality}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
