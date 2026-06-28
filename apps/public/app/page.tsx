import { apiClient } from "@/lib/api-client"
import { FixtureCard } from "@/components/fixture-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function Home() {
  let fixtures: any[] = []
  let competitions: any[] = []
  let error: string | null = null

  try {
    const today = new Date().toISOString().split("T")[0]
    fixtures = await apiClient.getMatches({
      dateFrom: today,
      dateTo: today,
    })
  } catch (err) {
    error = "Failed to load fixtures"
  }

  try {
    competitions = await apiClient.getCompetitions()
  } catch (err) {
    error = "Failed to load competitions"
  }

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          TODAY&apos;S FIXTURES
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Live scores and latest updates from school sports competitions
        </p>
      </div>

      {/* Fixtures Grid */}
      <div className="mb-12">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {fixtures.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fixtures.map((fixture) => (
              <FixtureCard key={fixture.id} match={fixture} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No fixtures scheduled for today
            </p>
          </div>
        )}
      </div>

      {/* Competitions Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          ACTIVE COMPETITIONS
        </h2>
        {competitions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((comp) => (
              <Link
                key={comp.id}
                href={`/competitions/${comp.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {comp.name}
                    </CardTitle>
                    <CardDescription>{comp.sport}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <span className="font-medium capitalize">
                          {comp.status}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Division:</span>{" "}
                        <span className="font-medium">{comp.division}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No active competitions at this time
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
