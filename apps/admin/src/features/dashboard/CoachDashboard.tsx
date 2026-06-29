import React from 'react';
import {
  Calendar,
  Users,
  AlertTriangle,
  Bell,
  Trophy,
  Clock,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { Team, Player, Fixture, Suspension, Notification } from '@ssmp/shared-types';

interface CoachDashboardProps {
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
  suspensions: Suspension[];
  notifications: Notification[];
  onNavigate: (tab: string) => void;
}

export default function CoachDashboard({
  teams,
  players,
  fixtures,
  suspensions,
  notifications,
  onNavigate,
}: CoachDashboardProps) {
  // In the demo, the coach's team is the first team
  const myTeam = teams[0];
  const myTeamPlayers = myTeam ? players.filter((p) => p.teamId === myTeam.id) : [];
  const myTeamFixtures = myTeam
    ? fixtures.filter((f) => f.homeTeamId === myTeam.id || f.awayTeamId === myTeam.id)
    : [];

  // Next upcoming match
  const now = new Date();
  const upcomingFixtures = myTeamFixtures
    .filter((f) => new Date(f.scheduledAt) > now && !['cancelled', 'walkover', 'published'].includes(f.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const nextMatch = upcomingFixtures[0];

  // Recent results (completed matches)
  const recentResults = myTeamFixtures
    .filter((f) => ['published', 'full_time'].includes(f.status) || (f.homeScore != null && f.awayScore != null))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5);

  // Suspended players for my team
  const mySuspendedPlayers = suspensions
    .filter((s) => !s.isServed && myTeamPlayers.some((p) => p.id === s.playerId))
    .map((s) => ({
      ...s,
      player: myTeamPlayers.find((p) => p.id === s.playerId),
    }));

  // Roster status
  const activePlayers = myTeamPlayers.filter((p) => p.status === 'active').length;
  const injuredPlayers = myTeamPlayers.filter((p) => p.status === 'injured').length;
  const suspendedPlayers = myTeamPlayers.filter((p) => p.status === 'suspended').length;

  // Notifications (for this coach)
  const myNotifications = notifications
    .filter((n) => n.userId === 'coach-001' || n.userId === myTeam?.coachId)
    .slice(0, 5);

  const kpiList = [
    {
      title: 'Roster Size',
      value: myTeamPlayers.length,
      icon: Users,
      desc: `${activePlayers} active`,
      color: 'text-[#121212] bg-[#F1F1ED] border-[#E5E5E1]',
    },
    {
      title: 'Suspended',
      value: suspendedPlayers + mySuspendedPlayers.length,
      icon: AlertTriangle,
      desc: 'Unavailable players',
      color: suspendedPlayers > 0 ? 'text-[#D43D2A] bg-red-50 border-red-100' : 'text-slate-400 bg-slate-50 border-slate-100',
    },
    {
      title: 'Upcoming Fixtures',
      value: upcomingFixtures.length,
      icon: Calendar,
      desc: 'Remaining matches',
      color: 'text-[#121212] bg-[#FBFBF9] border-[#E5E5E1]',
    },
    {
      title: 'Injured',
      value: injuredPlayers,
      icon: Shield,
      desc: 'Medical unavailability',
      color: injuredPlayers > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="rounded-none border border-[#121212] bg-[#121212] p-8 md:p-10 text-white">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#D43D2A]">
            Coach Dashboard
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-serif italic font-bold tracking-tight text-white">
            {myTeam?.name || 'My Team'} <span className="text-[#D43D2A]">Coach Portal</span>
          </h1>
          <p className="mt-4 text-xs md:text-sm text-[#8b8b85] leading-relaxed font-sans font-medium">
            {myTeam?.schoolName || ''} — Manage your roster, track upcoming fixtures, and monitor player availability for the championship.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('rosters')}
              className="editorial-btn-primary cursor-pointer"
            >
              Manage Roster
            </button>
            <button
              onClick={() => onNavigate('fixtures')}
              className="px-5 py-2.5 border border-white text-[11px] uppercase font-bold tracking-widest text-white hover:bg-white hover:text-black transition cursor-pointer"
            >
              View Fixtures
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
        {/* Next Match */}
        <div className="rounded-none border border-[#121212] bg-white p-6 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <Clock className="h-4 w-4 text-[#D43D2A]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212]">Next Match</h3>
          </div>
          {nextMatch ? (
            <div className="mt-6">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8b8b85]">Matchday {nextMatch.matchday}</span>
                <div className="mt-4 flex items-center justify-center gap-8">
                  <div className="text-right">
                    <span className="text-lg font-serif font-bold italic text-[#121212]">
                      {teams.find((t) => t.id === nextMatch.homeTeamId)?.name || 'TBD'}
                    </span>
                    {nextMatch.homeTeamId === myTeam?.id && (
                      <span className="block text-[9px] uppercase tracking-wider text-[#D43D2A] font-bold">Your Team</span>
                    )}
                  </div>
                  <span className="text-2xl font-serif italic text-[#8b8b85]">vs</span>
                  <div className="text-left">
                    <span className="text-lg font-serif font-bold italic text-[#121212]">
                      {teams.find((t) => t.id === nextMatch.awayTeamId)?.name || 'TBD'}
                    </span>
                    {nextMatch.awayTeamId === myTeam?.id && (
                      <span className="block text-[9px] uppercase tracking-wider text-[#D43D2A] font-bold">Your Team</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#8b8b85] font-mono">
                  {new Date(nextMatch.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {' · '}
                  {new Date(nextMatch.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {nextMatch.pitchId && (
                  <div className="mt-2 text-[10px] text-[#8b8b85] font-mono uppercase">Venue assigned</div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-[#8b8b85]">No upcoming fixtures</div>
          )}
        </div>

        {/* Suspended Players */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <AlertTriangle className="h-4 w-4 text-[#D43D2A]" /> Suspended Players
          </h3>
          <div className="mt-4 space-y-3">
            {mySuspendedPlayers.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">No suspended players</p>
            ) : (
              mySuspendedPlayers.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#E5E5E1] last:border-0">
                  <div>
                    <span className="text-sm font-serif font-bold italic text-[#121212]">
                      {s.player?.firstName} {s.player?.lastName}
                    </span>
                    <span className="block text-[10px] text-[#8b8b85] font-mono">#{s.player?.jerseyNumber}</span>
                  </div>
                  <span className="inline-flex px-2 py-0.5 bg-red-50 text-[9px] font-bold uppercase tracking-wider text-[#D43D2A] border border-red-100">
                    {s.matchesCount - s.matchesServed} match(es) left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Results */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <Trophy className="h-4 w-4 text-[#D43D2A]" /> Recent Results
          </h3>
          <div className="mt-4 divide-y divide-[#E5E5E1]">
            {recentResults.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">No completed matches yet</p>
            ) : (
              recentResults.map((f) => {
                const home = teams.find((t) => t.id === f.homeTeamId);
                const away = teams.find((t) => t.id === f.awayTeamId);
                const isHome = f.homeTeamId === myTeam?.id;
                const won = isHome ? (f.homeScore ?? 0) > (f.awayScore ?? 0) : (f.awayScore ?? 0) > (f.homeScore ?? 0);
                const drawn = f.homeScore === f.awayScore;
                return (
                  <div key={f.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm font-serif font-bold italic text-[#121212]">
                        {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                      </span>
                      <span className="block text-[10px] text-[#8b8b85] font-mono">
                        {new Date(f.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-[#121212]">
                        {f.homeScore ?? 0} - {f.awayScore ?? 0}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                        drawn ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : won ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-[#D43D2A] border-red-100'
                      }`}>
                        {drawn ? 'Draw' : won ? 'Win' : 'Loss'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-none border border-[#E5E5E1] bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] flex items-center gap-2 border-b border-[#E5E5E1] pb-4">
            <Bell className="h-4 w-4 text-[#121212]" /> Notifications
          </h3>
          <div className="mt-4 space-y-3">
            {myNotifications.length === 0 ? (
              <p className="py-4 text-xs text-[#8b8b85] text-center font-mono">No notifications</p>
            ) : (
              myNotifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 py-3 border-b border-[#E5E5E1] last:border-0 ${!n.isRead ? 'bg-[#FBFBF9]' : ''}`}>
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-[#D43D2A]' : 'bg-transparent'}`} />
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-[#121212]">{n.title}</span>
                    <p className="text-[11px] text-[#8b8b85] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-[#8b8b85] font-mono">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
