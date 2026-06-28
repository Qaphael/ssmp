import Link from "next/link"
import { cn } from "@/lib/utils"

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center gap-2 md:mr-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              S
            </div>
            <span className="hidden font-bold md:inline-block">SSMP</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/competitions"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            Competitions
          </Link>
          <Link
            href="/standings"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "text-muted-foreground"
            )}
          >
            Standings
          </Link>
        </div>
      </div>
    </nav>
  )
}
