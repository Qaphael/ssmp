import React from 'react';
import {
  Calendar,
  ClipboardCheck,
  Radio,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Fixture, Team, Official } from '@ssmp/shared-types';

interface OfficialDashboardProps {
  fixtures: Fixture[];
  teams: Team[];
  officials: Official[];
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

export default function OfficialDashboard({
  fixtures,
  teams,
  officials,
  onNavigate,
}: OfficialDashboardProps) {
  // In the demo, use the first official as "me"
  const me = officials[0];
  const myFixtures = me
    ? fixtures.filter((f) => f.officialId === me.id)
    : fixtures;

  // Today's assignments
  const todayAssignments = myFixtures.filter((f) => isToday(f.scheduledAt));

  // Pending reports: matches assigned to me that are in full_time but not yet reported/verified
  const pendingReports = myFixtures.filter(
    (f) => f.status === 'full_time' && !f.homeScore && !f.awayScore
  );

  // Live match
  const liveMatch = myFixtures.find((f) => isLive(f.status));

  // Upcoming assignments
  const now = new Date();
  const upcomingAssignments = myFixtures
    .filter((f) => new Date(f.scheduledAt) > now && !isToday(f.scheduledAt) && !['cancelled', 'walkover', 'published'].includes(f.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  const kpiList = [
    {
      title: "Today's Assignments",
      value: todayAssignments.length,
      icon: Calendar,
      desc: 'Matches to officiate',
      color: 'text-[#121212] bg-[#F1F1ED] border-[#E5E5E1]',
    },
    {
      title: 'Pending Reports',
      value: pendingReports.length,
      icon: FileText,
      desc: 'Awaiting score submission',
      color: pendingReports.length > 0 ? 'text-[#D43D2A] bg-red-50 border-red-100' : 'text-slate-400 bg-slate-50 border-slate-100',
    },
    {
      title: 'Total Assignments',
      value: myFixtures.length,
      icon: ClipboardCheck,
      desc: 'All season',
      color: 'text-[#121212] bg-[#FBFBF9] border-[#E5E5E1]',
    },
    {
      title: 'Completed',
      value: myFixtures.filter((f) => ['published', 'verified', 'report_submitted'].includes(f.status)).length,
      icon: CheckCircle,
      desc: 'Reports submitted',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="rounded-none border border-[#121212] bg-[#121212] p-8 md:p-10 text-white">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#D43D2A]">
            Official Dashboard
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-serif italic font-bold tracking-tight text-white">
            Match <span className="text-[#D43D2A]">Official Portal</span>
          </h1>
          <p className="mt-4 text-xs md:text-sm text-[#8b8b85] leading-relaxed font-sans font-medium">
            {me ? `${me.name} — ${me.certifications?.join(', ') || 'Certified Official'}` : 'Match Official'}
            {' · '}View your assignments, submit match reports, and manage live match events.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('officials')}
              className="editorial-btn-primary cursor-pointer"
            >
              View Assignments
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="group rounded-none border border-[#E5E5E1] bg-white p-6 transition-all hover:border-[#121212]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">{kpi.title}</span>
                <div className={`rounded-none p-2 border ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-[#121212] italic">{kpi.value}</span>
              </div>
              <p className="mt-2 text-[11px] text-[#8b8b85] font-semibold uppercase tracking-wider">{kpi.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Live Match */}
        {liveMatch && (
          <div className="rounded-none border-2 border-[#D43D2A] bg-white p-6 lg:col-span-3">
            <div className="flex items-center gap-2 border-b border-red-100 pb-4">
              <Radio className="h-4 w-4 text-[#D43D2A] animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D43D2A]">Live Match — In Progress</h3>
            </div>
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-12">
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold italic text-[#121212]">
                    {teams.find((t) => t.id === liveMatch.homeTeamId)?.name || 'TBD'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-serif font-bold text-[#121212]">
                    {liveMatch.homeScore ?? 0} - {liveMatch.awayScore ?? 0}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[9px] font-bold uppercase tracking-wider text-[#D43D2A] border border-red-100">
                    <span className="w-1.5 h-1.5 bg-[#D43D2A] rounded-full animate-pulse" />
                    {liveMatch.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-serif font-bold italic text-[#121212]">
                    {teams.find((t) => t.id === liveMatch.awayTeamId)?.name || 'TBD'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('officials')}
                className="mt-6 editorial-btn-primary cursor-pointer"
              >
                Open Match Control
              </button>
            </div>
          </div>
        )}

        {/* Today's Assignments */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D43D2A]" /> Today's Assignments
            </h3>
            <button
              onClick={() => onNavigate('officials')}
              className="text-[11px] uppercase tracking-wider font-bold text-[#D43D2A] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          <div className="mt-4 divide-y divide-[#E5E5E1]">
            {todayAssignments.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">No assignments today</p>
            ) : (
              todayAssignments.map((f) => {
                const home = teams.find((t) => t.id === f.homeTeamId);
                const away = teams.find((t) => t.id === f.awayTeamId);
                return (
                  <div key={f.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm font-serif font-bold italic text-[#121212]">
                        {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                      </span>
                      <div className="text-[10px] text-[#8b8b85] font-mono uppercase">
                        {new Date(f.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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

        {/* Pending Reports */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <FileText className="h-4 w-4 text-[#D43D2A]" /> Pending Reports
          </h3>
          <div className="mt-4 space-y-3">
            {pendingReports.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">All reports submitted</p>
            ) : (
              pendingReports.map((f) => {
                const home = teams.find((t) => t.id === f.homeTeamId);
                const away = teams.find((t) => t.id === f.awayTeamId);
                return (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b border-[#E5E5E1] last:border-0">
                    <div>
                      <span className="text-sm font-serif font-bold italic text-[#121212]">
                        {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                      </span>
                      <span className="block text-[10px] text-[#8b8b85] font-mono">
                        {new Date(f.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate('officials')}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#D43D2A] hover:underline cursor-pointer"
                    >
                      Submit →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <Clock className="h-4 w-4 text-[#8b8b85]" /> Upcoming Assignments
          </h3>
          <div className="mt-4 divide-y divide-[#E5E5E1]">
            {upcomingAssignments.map((f) => {
              const home = teams.find((t) => t.id === f.homeTeamId);
              const away = teams.find((t) => t.id === f.awayTeamId);
              return (
                <div key={f.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <span className="text-sm font-serif font-bold italic text-[#121212]">
                      {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                    </span>
                    <div className="text-[10px] text-[#8b8b85] font-mono">
                      {new Date(f.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(f.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#8b8b85]">Matchday {f.matchday}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
