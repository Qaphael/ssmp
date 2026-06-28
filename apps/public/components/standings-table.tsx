"use client"

import Link from "next/link"
import type { Team } from "@ssmp/shared-types"

interface StandingsEntry {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface StandingsTableProps {
  standings: StandingsEntry[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left font-semibold p-3 w-12">#</th>
            <th className="text-left font-semibold p-3">Team</th>
            <th className="text-center font-semibold p-3 w-12">P</th>
            <th className="text-center font-semibold p-3 w-12">W</th>
            <th className="text-center font-semibold p-3 w-12">D</th>
            <th className="text-center font-semibold p-3 w-12">L</th>
            <th className="text-center font-semibold p-3 w-12">GF</th>
            <th className="text-center font-semibold p-3 w-12">GA</th>
            <th className="text-center font-semibold p-3 w-12 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, index) => (
            <tr
              key={entry.team.id}
              className="border-b hover:bg-muted/50 transition-colors"
            >
              <td className="p-3 font-semibold text-muted-foreground w-12">
                {index + 1}
              </td>
              <td className="p-3">
                <Link
                  href={`/teams/${entry.team.id}`}
                  className="font-medium hover:underline hover:text-primary"
                >
                  {entry.team.schoolName}
                </Link>
              </td>
              <td className="p-3 text-center">{entry.played}</td>
              <td className="p-3 text-center text-green-600 font-medium">
                {entry.won}
              </td>
              <td className="p-3 text-center text-yellow-600 font-medium">
                {entry.drawn}
              </td>
              <td className="p-3 text-center text-red-600 font-medium">
                {entry.lost}
              </td>
              <td className="p-3 text-center">{entry.goalsFor}</td>
              <td className="p-3 text-center">{entry.goalsAgainst}</td>
              <td className="p-3 text-center font-bold">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
