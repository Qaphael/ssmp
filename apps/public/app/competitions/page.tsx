import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata = {
  title: "Competitions - SSMP",
  description: "Browse all school sports competitions",
}

export default async function CompetitionsPage() {
  let competitions: any[] = []
  let error: string | null = null

  try {
    competitions = await apiClient.getCompetitions()
  } catch (err) {
    error = "Failed to load competitions"
  }

  return (
    <main className="container max-w-screen-2xl py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          COMPETITIONS
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse all school sports competitions and view standings
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {competitions.map((comp) => (
          <Link
            key={comp.id}
            href={`/competitions/${comp.id}`}
            className="group"
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {comp.name}
                </CardTitle>
                <CardDescription>{comp.sport}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Division</p>
                    <p className="font-medium">{comp.division}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{comp.status}</p>
                  </div>
                  {comp.startDate && (
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {new Date(comp.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {competitions.length === 0 && !error && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No competitions available at this time
          </p>
        </div>
      )}
    </main>
  )
}
