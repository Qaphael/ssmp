import React from 'react';
import {
  Trophy,
  Building2,
  Users,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Radio,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { Competition, Team, Player, TeamRegistration, RosterSubmission, Fixture, Official } from '@ssmp/shared-types';

interface CompAdminDashboardProps {
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  registrations: TeamRegistration[];
  rosters: RosterSubmission[];
  fixtures: Fixture[];
  officials: Official[];
  clashCount: number;
  onNavigate: (tab: string) => void;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isLive(status: string): boolean {
  return ['kickoff', 'half_time', 'second_half', 'extra_time', 'penalties'].includes(status);
}

export default function CompAdminDashboard({
  competitions,
  teams,
  players,
  registrations,
  rosters,
  fixtures,
  officials,
  clashCount,
  onNavigate,
}: CompAdminDashboardProps) {
  const pendingRegs = registrations.filter((r) => r.status === 'pending').length;
  const approvedRegs = registrations.filter((r) => r.status === 'approved').length;
  const pendingRosters = rosters.filter((r) => r.status === 'submitted').length;

  const todayMatches = fixtures.filter((f) => isToday(f.scheduledAt));
  const liveMatches = fixtures.filter((f) => isLive(f.status));

  const assignedToday = fixtures.filter((f) => isToday(f.scheduledAt) && f.officialId).length;
  const officialsAvailable = officials.length;

  const kpiList = [
    {
      title: "Today's Matches",
      value: todayMatches.length,
      icon: Calendar,
      desc: 'Scheduled for today',
      color: 'text-[#121212] bg-[#F1F1ED] border-[#E5E5E1]',
    },
    {
      title: 'Pending Approvals',
      value: pendingRegs + pendingRosters,
      icon: Building2,
      desc: `${pendingRegs} registrations, ${pendingRosters} rosters`,
      color: 'text-[#D43D2A] bg-red-50 border-red-100',
    },
    {
      title: 'Officials Assigned Today',
      value: `${assignedToday}/${todayMatches.length || 0}`,
      icon: UserCheck,
      desc: `${officialsAvailable} officials total`,
      color: 'text-[#121212] bg-[#FBFBF9] border-[#E5E5E1]',
    },
    {
      title: 'Venue Conflicts',
      value: clashCount,
      icon: AlertTriangle,
      desc: 'Overlapping fixture slots',
      color: clashCount > 0 ? 'text-[#D43D2A] bg-red-50 border-red-200 animate-pulse' : 'text-slate-400 bg-slate-50 border-slate-100',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="rounded-none border border-[#121212] bg-[#121212] p-8 md:p-10 text-white">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#D43D2A]">
            Competition Admin Dashboard
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
              className="group rounded-none border border-[#E5E5E1] bg-white p-6 transition-all hover:border-[#121212]"
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
                {kpi.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <div className="rounded-none border border-[#D43D2A] bg-white p-6 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-red-100 pb-4">
              <Radio className="h-4 w-4 text-[#D43D2A] animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D43D2A]">Live Matches</h3>
            </div>
            <div className="mt-4 space-y-3">
              {liveMatches.map((f) => {
                const home = teams.find((t) => t.id === f.homeTeamId);
                const away = teams.find((t) => t.id === f.awayTeamId);
                return (
                  <div key={f.id} className="flex items-center justify-between py-3 border-b border-[#E5E5E1] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[9px] font-bold uppercase tracking-wider text-[#D43D2A] border border-red-100">
                        <span className="w-1.5 h-1.5 bg-[#D43D2A] rounded-full animate-pulse" />
                        {f.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-serif font-bold italic text-[#121212]">
                        {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#8b8b85]">
                      {f.homeScore ?? 0} - {f.awayScore ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's Matches */}
        <div className={`rounded-none border border-[#E5E5E1] bg-white p-6 ${liveMatches.length > 0 ? '' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D43D2A]" /> Today's Matches
            </h3>
            <button
              onClick={() => onNavigate('fixtures')}
              className="text-[11px] uppercase tracking-wider font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="mt-4 divide-y divide-[#E5E5E1]">
            {todayMatches.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">No matches scheduled today</p>
            ) : (
              todayMatches.slice(0, 5).map((f) => {
                const home = teams.find((t) => t.id === f.homeTeamId);
                const away = teams.find((t) => t.id === f.awayTeamId);
                return (
                  <div key={f.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm font-serif font-bold italic text-[#121212]">
                        {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                      </span>
                      <div className="text-[10px] text-[#8b8b85] font-mono uppercase">
                        Matchday {f.matchday} · {new Date(f.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                      isLive(f.status) ? 'bg-red-50 text-[#D43D2A] border-red-100' : 'bg-[#FBFBF9] text-[#121212] border-[#E5E5E1]'
                    }`}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Registration Status */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <TrendingUp className="h-4 w-4 text-[#121212]" /> Registration Status
          </h3>
          <div className="mt-6 space-y-5">
            {competitions.map((comp) => {
              const compTeams = teams.filter((t) => t.competitionId === comp.id);
              const approved = compTeams.filter((t) => t.registrationStatus === 'approved').length;
              const total = compTeams.length;
              return (
                <div key={comp.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#121212]">{comp.name}</span>
                    <span className="text-[10px] font-mono text-[#8b8b85]">{approved}/{total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F1F1ED] border border-[#E5E5E1]">
                    <div className="h-full bg-[#D43D2A]" style={{ width: `${total ? (approved / total) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E5E1]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b8b85] font-semibold">Active athletes</span>
              <span className="font-bold font-mono text-[#121212]">{players.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
