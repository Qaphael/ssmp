/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Trophy,
  Building2,
  Users,
  AlertTriangle,
  Flame,
  Calendar,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Competition, Team, Player, TeamRegistration, RosterSubmission } from '@ssmp/shared-types';

interface DashboardProps {
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  registrations: TeamRegistration[];
  rosters: RosterSubmission[];
  clashCount: number;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  competitions,
  teams,
  players,
  registrations,
  rosters,
  clashCount,
  onNavigate,
}: DashboardProps) {
  // Stats
  const activeComps = competitions.length;
  const pendingRegs = registrations.filter((r) => r.status === 'pending').length;
  const approvedRegs = registrations.filter((r) => r.status === 'approved').length;
  const pendingRosters = rosters.filter((r) => r.status === 'submitted').length;
  const activeAthletes = players.length;

  const kpiList = [
    {
      title: 'Active Tournaments',
      value: activeComps,
      icon: Trophy,
      desc: 'Configured district categories',
      color: 'text-[#121212] bg-[#F1F1ED] border-[#E5E5E1]',
      tab: 'wizard',
    },
    {
      title: 'Pending Applications',
      value: pendingRegs,
      icon: Building2,
      desc: 'Awaiting eligibility review',
      color: 'text-[#D43D2A] bg-red-50 border-red-100',
      tab: 'registrations',
    },
    {
      title: 'Submitted Rosters',
      value: pendingRosters,
      icon: Users,
      desc: 'Player compliance reviews',
      color: 'text-[#121212] bg-[#FBFBF9] border-[#E5E5E1]',
      tab: 'rosters',
    },
    {
      title: 'Venue Conflicts',
      value: clashCount,
      icon: AlertTriangle,
      desc: 'Overlapping fixture slots',
      color: clashCount > 0 ? 'text-[#D43D2A] bg-red-50 border-red-200 animate-pulse' : 'text-slate-400 bg-slate-50 border-slate-100',
      tab: 'fixtures',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="rounded-none border border-[#121212] bg-[#121212] p-8 md:p-10 text-white">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#D43D2A]">
            District Administration Hub
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-serif italic font-bold tracking-tight text-white">
            Metro District <span className="text-[#D43D2A]">Championship</span>
          </h1>
          <p className="mt-4 text-xs md:text-sm text-[#8b8b85] leading-relaxed font-sans font-medium">
            Centralized sports administrator console. Deploy bracket templates, oversee registrar queues, and rectify fixture conflicts in real time with high-precision scheduling tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('wizard')}
              className="editorial-btn-primary cursor-pointer"
            >
              Configure Tournament
            </button>
            <button
              onClick={() => onNavigate('fixtures')}
              className="px-5 py-2.5 border border-white text-[11px] uppercase font-bold tracking-widest text-white hover:bg-white hover:text-black transition cursor-pointer"
            >
              Analyze Clashes
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(kpi.tab)}
              className="group cursor-pointer rounded-none border border-[#E5E5E1] bg-white p-6 transition-all hover:border-[#121212]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">
                  {kpi.title}
                </span>
                <div className={`rounded-none p-2 border ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-[#121212] italic">
                  {kpi.value}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-[#8b8b85] group-hover:text-[#D43D2A] transition font-semibold uppercase tracking-wider">
                {kpi.desc} →
              </p>
            </div>
          );
        })}
      </div>

      {/* Overview lists / detail grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Active Competitions Lists */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#D43D2A]" /> Current Tournaments
            </h3>
            <button
              onClick={() => onNavigate('wizard')}
              className="text-[11px] uppercase tracking-wider font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              + Create New
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#E5E5E1]">
            {competitions.map((comp) => {
              const compTeams = teams.filter((t) => t.competitionId === comp.id);
              const approvedCount = compTeams.filter((t) => t.registrationStatus === 'approved').length;

              return (
                <div key={comp.id} className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <span className="text-sm font-serif font-bold italic text-[#121212]">{comp.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-[#8b8b85] font-mono uppercase">
                      <span>{comp.sport}</span>
                      <span>•</span>
                      <span>{comp.division || 'District Pool'}</span>
                      <span>•</span>
                      <span className="text-[#121212] font-semibold">{approvedCount} School Team(s)</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 border border-[#E5E5E1] px-2 py-1 text-[9px] font-bold font-mono text-[#121212] uppercase">
                    Registration Open
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schools Statistics Summary */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <Building2 className="h-4 w-4 text-[#121212]" /> Registrars Digest
          </h3>

          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#8b8b85] font-bold">Approved school applications</span>
              <span className="text-xs font-bold font-mono text-[#121212]">{approvedRegs}</span>
            </div>
            <div className="h-2 w-full rounded-none bg-[#F1F1ED] border border-[#E5E5E1]">
              <div
                className="h-full bg-[#D43D2A]"
                style={{
                  width: `${registrations.length ? (approvedRegs / registrations.length) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="pt-3 flex items-center justify-between text-xs border-t border-[#E5E5E1]">
              <span className="text-slate-500 font-semibold">Active rostered athletes</span>
              <span className="font-bold font-mono text-[#121212]">{activeAthletes} Total</span>
            </div>

            <div className="bg-[#FBFBF9] p-4 border border-[#E5E5E1] mt-4 text-[11px] text-slate-500 leading-relaxed font-sans">
              💡 Registering and approving school team applications instantly provisions team layouts for coaches, allowing compliance roster submissions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
