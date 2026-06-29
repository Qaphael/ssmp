/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Trophy,
  Calendar,
  Shield,
  Activity,
  Plus,
  Trash2,
  Lock,
  UserCheck,
  AlertCircle,
  FileCheck,
  Award,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Official, Fixture, Team, Player, MatchEvent, MatchEventType, Competition, UserRole } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';
import { connectSocket, disconnectSocket, isConnected, joinMatchRoom, leaveMatchRoom, onMatchEvent, onScoreUpdate, onStatusChange, onConnectionChange, fetchDevToken } from '../../shared/api/socket';
import * as matchApi from '../../shared/api/matchApi';

interface OfficialsMatchEventsProps {
  officials: Official[];
  fixtures: Fixture[];
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matchEvents: MatchEvent[];
  onActionCompleted: () => void;
  currentRole: UserRole;
}

export default function OfficialsMatchEvents({
  officials,
  fixtures,
  teams,
  players,
  competitions,
  matchEvents,
  onActionCompleted,
  currentRole,
}: OfficialsMatchEventsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'matchcenter' | 'officials'>('matchcenter');

  // Socket.IO state
  const [socketConnected, setSocketConnected] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Officials creation state
  const [newOffName, setNewOffName] = useState('');
  const [newOffEmail, setNewOffEmail] = useState('');
  const [newOffPhone, setNewOffPhone] = useState('');
  const [newOffCert, setNewOffCert] = useState('');
  const [newOffShow, setNewOffShow] = useState(false);

  // Live match center state
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [liveMatches, setLiveMatches] = useState<matchApi.MatchData[]>([]);
  const [liveMatchEvents, setLiveMatchEvents] = useState<matchApi.MatchEventData[]>([]);
  const [eventMinute, setEventMinute] = useState(1);
  const [eventType, setEventType] = useState<MatchEventType>('goal');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState('');

  // Lock status and results states
  const [showPostponeInput, setShowPostponeInput] = useState(false);
  const [postponeReasonText, setPostponeReasonText] = useState('');
  const [showWalkoverInput, setShowWalkoverInput] = useState(false);
  const [walkoverWinnerId, setWalkoverWinnerId] = useState('');
  const [walkoverReasonText, setWalkoverReasonText] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [showAbandonInput, setShowAbandonInput] = useState(false);
  const [abandonReasonText, setAbandonReasonText] = useState('');

  // Current user (mock for dev)
  const currentUserId = currentRole === 'official' ? 'official-001' : 'admin-001';

  // Selected match data
  const selectedMatch = liveMatches.find((m) => m.id === selectedMatchId);
  const matchHomeTeam = selectedMatch ? teams.find((t) => t.id === selectedMatch.home_team_id) : null;
  const matchAwayTeam = selectedMatch ? teams.find((t) => t.id === selectedMatch.away_team_id) : null;

  const activeMatchPlayers = players.filter(
    (p) =>
      selectedMatch &&
      (p.teamId === selectedMatch.home_team_id || p.teamId === selectedMatch.away_team_id)
  );

  const getTeamName = (tid: string) => {
    const t = teams.find((tm) => tm.id === tid);
    return t ? t.name : 'Unknown Team';
  };

  const getOfficialName = (oid?: string) => {
    if (!oid) return 'Unassigned';
    const o = officials.find((off) => off.id === oid);
    return o ? o.name : 'Unassigned';
  };

  const getPlayerName = (pid: string) => {
    const p = players.find((pl) => pl.id === pid);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Athlete';
  };

  const getCompName = (cid: string) => {
    const c = competitions.find((co) => co.id === cid);
    return c ? c.name : 'Unknown Championship';
  };

  // Check API availability and init Socket.IO
  useEffect(() => {
    const apiUrl = mockDb.getApiUrl();
    if (!apiUrl) return;

    setApiAvailable(true);
    let cancelled = false;

    fetchDevToken(apiUrl, currentRole).then((token) => {
      if (cancelled || !token) return;
      connectSocket(apiUrl, token);

      const unsub = onConnectionChange(() => {
        setSocketConnected(isConnected());
      });

      setSocketConnected(isConnected());

      return () => {
        unsub();
      };
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [currentRole]);

  // Fetch matches from API when API is available
  const fetchMatches = useCallback(async () => {
    if (!apiAvailable) return;
    setLoadingMatches(true);
    setMatchError('');
    try {
      const filters: any = {};
      if (currentRole === 'official') {
        filters.officialId = currentUserId;
      }
      const matches = await matchApi.listMatches(filters);
      setLiveMatches(matches);
    } catch {
      // API match list unavailable (no DB?) — fall back to mockDb fixtures, keep Socket.IO
      const mockFixtures = fixtures.map((f) => ({
        id: f.id,
        fixture_id: f.id,
        competition_id: f.competitionId,
        home_team_id: f.homeTeamId,
        away_team_id: f.awayTeamId,
        home_score: f.homeScore ?? 0,
        away_score: f.awayScore ?? 0,
        status: f.status,
        scheduled_at: f.scheduledAt,
        official_id: f.officialId,
        matchday: f.matchday,
        home_team_name: getTeamName(f.homeTeamId),
        away_team_name: getTeamName(f.awayTeamId),
      }));
      setLiveMatches(mockFixtures);
    } finally {
      setLoadingMatches(false);
    }
  }, [apiAvailable, currentRole, currentUserId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Socket.IO listeners for live updates
  useEffect(() => {
    if (!socketConnected || !selectedMatchId) return;

    joinMatchRoom(selectedMatchId);

    const unsubEvent = onMatchEvent((data: any) => {
      if (data.matchId === selectedMatchId) {
        setLiveMatchEvents((prev) => {
          if (prev.some((e) => e.id === data.event.id)) return prev;
          return [...prev, data.event];
        });
      }
    });

    const unsubScore = onScoreUpdate((data: any) => {
      if (data.matchId === selectedMatchId) {
        setLiveMatches((prev) =>
          prev.map((m) =>
            m.id === selectedMatchId
              ? { ...m, home_score: data.homeScore, away_score: data.awayScore }
              : m
          )
        );
      }
    });

    const unsubStatus = onStatusChange((data: any) => {
      if (data.matchId === selectedMatchId) {
        setLiveMatches((prev) =>
          prev.map((m) =>
            m.id === selectedMatchId ? { ...m, status: data.status } : m
          )
        );
      }
    });

    return () => {
      leaveMatchRoom(selectedMatchId);
      unsubEvent();
      unsubScore();
      unsubStatus();
    };
  }, [socketConnected, selectedMatchId]);

  // Fetch match events when selecting a match
  useEffect(() => {
    if (!selectedMatchId || !apiAvailable) {
      setLiveMatchEvents([]);
      return;
    }
    matchApi.listMatchEvents(selectedMatchId).then(setLiveMatchEvents).catch(() => {});
  }, [selectedMatchId, apiAvailable]);

  // Handlers for Officials (still mockDb)
  const handleAddOfficial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffName || !newOffEmail) return;
    mockDb.saveOfficial({
      userId: `user-off-${Math.random().toString(36).substring(7)}`,
      name: newOffName,
      email: newOffEmail,
      phone: newOffPhone,
      certifications: newOffCert ? newOffCert.split(',').map((c) => c.trim()) : ['District Referee'],
      availability: { weekdayEvenings: true, weekends: true, holidays: true },
    });
    setNewOffName('');
    setNewOffEmail('');
    setNewOffPhone('');
    setNewOffCert('');
    setNewOffShow(false);
    onActionCompleted();
  };

  const handleDeleteOfficial = (id: string) => {
    mockDb.deleteOfficial(id);
    onActionCompleted();
  };

  // Handlers for Live Match Center (API-backed)
  const handleAssignReferee = async (refId: string) => {
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.assignOfficial(selectedMatch.id, refId);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleUpdateStatus = async (status: Fixture['status']) => {
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.updateMatchStatus(selectedMatch.id, status as any);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (status === 'kickoff') {
        setLiveMatchEvents([]);
      }
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleAddMatchEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !apiAvailable) return;

    let resolvedTeamId = eventTeamId;
    if (eventPlayerId && !resolvedTeamId) {
      const p = players.find((pl) => pl.id === eventPlayerId);
      if (p) resolvedTeamId = p.teamId;
    }

    try {
      await matchApi.recordEvent(selectedMatch.id, {
        matchId: selectedMatch.id,
        type: eventType,
        minute: Number(eventMinute),
        playerId: eventPlayerId || undefined,
        teamId: resolvedTeamId || undefined,
        description: eventDesc || undefined,
        recordedBy: currentUserId,
      });

      setEventPlayerId('');
      setEventDesc('');
      setEventMinute(eventMinute < 90 ? eventMinute + 5 : 90);
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handlePostponeMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !postponeReasonText || !apiAvailable) return;
    try {
      const updated = await matchApi.postponeMatch(selectedMatch.id, postponeReasonText);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowPostponeInput(false);
      setPostponeReasonText('');
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleWalkoverMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !walkoverWinnerId || !apiAvailable) return;
    try {
      const updated = await matchApi.recordWalkover(
        selectedMatch.id,
        walkoverWinnerId,
        walkoverReasonText || 'Opposing team failed to produce compliant minimum roster size.'
      );
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowWalkoverInput(false);
      setWalkoverWinnerId('');
      setWalkoverReasonText('');
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleCancelMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.updateMatchStatus(selectedMatch.id, 'cancelled');
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowCancelInput(false);
      setCancelReasonText('');
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleAbandonMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.updateMatchStatus(selectedMatch.id, 'abandoned');
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowAbandonInput(false);
      setAbandonReasonText('');
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleSubmitReport = async (homeScore: number, awayScore: number) => {
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.submitReport(selectedMatch.id, homeScore, awayScore);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handleVerify = async () => {
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.verifyMatch(selectedMatch.id);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  const handlePublish = async () => {
    if (!selectedMatch || !apiAvailable) return;
    try {
      const updated = await matchApi.publishMatch(selectedMatch.id);
      setLiveMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err: any) {
      setMatchError(err.message);
    }
  };

  // Get the fixture data (from mockDb for backwards compat or from live API)
  const getSelectedFixture = (): Fixture | null => {
    if (selectedMatch) {
      return {
        id: selectedMatch.id,
        competitionId: selectedMatch.competition_id,
        matchday: selectedMatch.matchday || 1,
        homeTeamId: selectedMatch.home_team_id,
        awayTeamId: selectedMatch.away_team_id,
        scheduledAt: selectedMatch.scheduled_at,
        status: selectedMatch.status as any,
        homeScore: selectedMatch.home_score,
        awayScore: selectedMatch.away_score,
        officialId: selectedMatch.official_id,
        createdAt: '',
        updatedAt: '',
      } as Fixture;
    }
    return null;
  };

  // Status transition helpers
  const canTransitionTo = (target: string): boolean => {
    if (!selectedMatch) return false;
    const transitions: Record<string, string[]> = {
      scheduled: ['officials_assigned', 'cancelled', 'postponed', 'walkover'],
      officials_assigned: ['scheduled', 'lineups_submitted', 'cancelled', 'postponed', 'walkover'],
      lineups_submitted: ['officials_assigned', 'lineups_locked', 'cancelled', 'postponed', 'walkover'],
      lineups_locked: ['kickoff', 'cancelled', 'postponed', 'walkover'],
      kickoff: ['half_time', 'cancelled', 'abandoned'],
      half_time: ['second_half', 'cancelled', 'abandoned'],
      second_half: ['extra_time', 'full_time', 'cancelled', 'abandoned'],
      extra_time: ['penalties', 'full_time', 'cancelled', 'abandoned'],
      penalties: ['full_time', 'cancelled', 'abandoned'],
      full_time: ['report_submitted', 'walkover'],
      report_submitted: ['verified'],
      verified: ['published'],
    };
    return transitions[selectedMatch.status]?.includes(target) || false;
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Page Header */}
      <div className="border-b border-[#121212] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#121212]">
              Officials & <span className="text-[#D43D2A]">Match Center</span>
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 font-bold leading-normal">
              Registry of certified referees and real-time live scorekeeping portal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {apiAvailable ? (
              <span className={`flex items-center gap-1.5 text-[10px] font-mono font-bold ${socketConnected ? 'text-green-600' : 'text-amber-500'}`}>
                {socketConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {socketConnected ? 'LIVE' : 'CONNECTING...'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400">
                <AlertCircle className="h-3.5 w-3.5" /> OFFLINE (mock)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {matchError && (
        <div className="border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-red-700 text-[11px]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{matchError}</span>
          <button onClick={() => setMatchError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E1]">
        <button
          onClick={() => setActiveSubTab('matchcenter')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'matchcenter'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Real-time Match Center
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('officials')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'officials'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Referee Registry
            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#121212] text-white font-bold rounded-none">
              {officials.length} LISTED
            </span>
          </span>
        </button>
      </div>

      {activeSubTab === 'matchcenter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: match selection and status controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-[#121212] bg-white p-6 rounded-none">
              <h2 className="text-xs uppercase tracking-wider text-[#121212] font-bold border-b border-[#121212] pb-3 mb-4">
                {currentRole === 'official' ? 'Your Assigned Matches' : 'Select Fixture to Administer'}
              </h2>

              {loadingMatches ? (
                <div className="py-4 text-center text-slate-400 italic">Loading matches...</div>
              ) : !apiAvailable ? (
                <div className="py-4 text-center text-slate-400">
                  <p className="font-serif italic mb-2">API not configured. Using offline mock data.</p>
                  <p className="text-[10px]">Set the API URL in the header to connect to the live server.</p>
                </div>
              ) : (
                <select
                  value={selectedMatchId}
                  onChange={(e) => {
                    setSelectedMatchId(e.target.value);
                    setShowPostponeInput(false);
                    setShowWalkoverInput(false);
                  }}
                  className="w-full border border-[#E5E5E1] bg-white px-4 py-2.5 text-xs focus:ring-0 focus:outline-none font-sans font-medium"
                >
                  <option value="">-- Choose Scheduled Fixture --</option>
                  {(apiAvailable ? liveMatches : fixtures).map((f: any) => {
                    const homeName = apiAvailable ? (f.home_team_name || getTeamName(f.home_team_id)) : getTeamName(f.homeTeamId);
                    const awayName = apiAvailable ? (f.away_team_name || getTeamName(f.away_team_id)) : getTeamName(f.awayTeamId);
                    const status = f.status;
                    const matchday = f.matchday;
                    const id = f.id;
                    return (
                      <option key={id} value={id}>
                        Matchday {matchday} • {homeName} vs {awayName} [{status.toUpperCase()}]
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {selectedMatch && matchHomeTeam && matchAwayTeam ? (
              <div className="space-y-6">
                {/* Scoreboard block */}
                <div className="border border-[#121212] bg-white p-6 relative rounded-none shadow-sm text-center">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-[#121212]" />

                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    {getCompName(selectedMatch.competition_id)} • Matchday {selectedMatch.matchday}
                  </p>

                  <div className="my-6 grid grid-cols-3 items-center">
                    <div className="text-right pr-4">
                      <h3 className="text-lg font-serif font-bold text-[#121212]">{matchHomeTeam.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 font-mono">
                        {matchHomeTeam.schoolName}
                      </p>
                    </div>

                    <div className="border-x border-[#E5E5E1] py-2 flex flex-col justify-center items-center">
                      <div className="text-3xl font-serif font-bold italic tracking-tight text-[#121212]">
                        {selectedMatch.status === 'scheduled' || selectedMatch.status === 'postponed' ? (
                          <span className="text-sm font-sans uppercase font-bold tracking-widest text-slate-400">
                            VS
                          </span>
                        ) : (
                          `${selectedMatch.home_score ?? 0} - ${selectedMatch.away_score ?? 0}`
                        )}
                      </div>
                      <span className="mt-2 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border bg-red-50 text-[#D43D2A] border-red-100 font-mono animate-pulse">
                        {selectedMatch.status}
                      </span>
                    </div>

                    <div className="text-left pl-4">
                      <h3 className="text-lg font-serif font-bold text-[#121212]">{matchAwayTeam.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 font-mono">
                        {matchAwayTeam.schoolName}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E5E1] pt-4 flex flex-wrap justify-between items-center text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-[#D43D2A]" />
                      <span>Assigned Official: </span>
                      <strong className="text-[#121212] font-mono">
                        {getOfficialName(selectedMatch.official_id)}
                      </strong>
                    </div>

                    {currentRole !== 'official' && (
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Assign Referee:</label>
                        <select
                          value={selectedMatch.official_id || ''}
                          onChange={(e) => handleAssignReferee(e.target.value)}
                          className="border border-[#E5E5E1] bg-white px-2 py-1 text-[11px] focus:ring-0 focus:outline-none font-sans font-semibold"
                        >
                          <option value="">-- Select Official --</option>
                          {officials.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Status transitions */}
                <div className="border border-[#E5E5E1] bg-[#FBFBF9] p-5 rounded-none space-y-4">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2">
                    Match Status Transitions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {canTransitionTo('officials_assigned') && selectedMatch.status === 'scheduled' && currentRole !== 'official' && (
                      <button
                        onClick={() => handleUpdateStatus('officials_assigned')}
                        className="px-4 py-2 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Assign Officials
                      </button>
                    )}

                    {canTransitionTo('kickoff') && (
                      <button
                        onClick={() => handleUpdateStatus('kickoff')}
                        className="px-4 py-2 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Initiate Kickoff (Live)
                      </button>
                    )}

                    {canTransitionTo('half_time') && (
                      <button
                        onClick={() => handleUpdateStatus('half_time')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Half Time
                      </button>
                    )}

                    {canTransitionTo('second_half') && (
                      <button
                        onClick={() => handleUpdateStatus('second_half')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Second Half
                      </button>
                    )}

                    {canTransitionTo('full_time') && (
                      <button
                        onClick={() => handleUpdateStatus('full_time')}
                        className="px-4 py-2 bg-[#D43D2A] hover:bg-red-700 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        End Match (Full Time)
                      </button>
                    )}

                    {canTransitionTo('report_submitted') && (
                      <button
                        onClick={() => handleSubmitReport(selectedMatch.home_score, selectedMatch.away_score)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Submit Report
                      </button>
                    )}

                    {canTransitionTo('verified') && currentRole !== 'official' && (
                      <button
                        onClick={handleVerify}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Verify Report
                      </button>
                    )}

                    {canTransitionTo('published') && currentRole !== 'official' && (
                      <button
                        onClick={handlePublish}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Publish Results
                      </button>
                    )}

                    {canTransitionTo('postponed') && (
                      <button
                        onClick={() => { setShowPostponeInput(!showPostponeInput); setShowWalkoverInput(false); }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-amber-400 hover:text-amber-700 text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Postpone Match
                      </button>
                    )}

                    {canTransitionTo('walkover') && (
                      <button
                        onClick={() => { setShowWalkoverInput(!showWalkoverInput); setShowPostponeInput(false); setShowCancelInput(false); setShowAbandonInput(false); }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-red-400 hover:text-[#D43D2A] text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Declare Walkover
                      </button>
                    )}

                    {canTransitionTo('cancelled') && (
                      <button
                        onClick={() => { setShowCancelInput(!showCancelInput); setShowPostponeInput(false); setShowWalkoverInput(false); setShowAbandonInput(false); }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-red-400 hover:text-[#D43D2A] text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Cancel Match
                      </button>
                    )}

                    {canTransitionTo('abandoned') && (
                      <button
                        onClick={() => { setShowAbandonInput(!showAbandonInput); setShowPostponeInput(false); setShowWalkoverInput(false); setShowCancelInput(false); }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-orange-400 hover:text-orange-700 text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Abandon Match
                      </button>
                    )}
                  </div>

                  {showPostponeInput && (
                    <form onSubmit={handlePostponeMatch} className="mt-4 border border-[#E5E5E1] bg-white p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Postponement Details</p>
                      <input
                        type="text"
                        placeholder="e.g. Extreme lightning delay and thunderstorm..."
                        value={postponeReasonText}
                        onChange={(e) => setPostponeReasonText(e.target.value)}
                        className="w-full border border-[#E5E5E1] px-3 py-1.5 focus:ring-0 focus:outline-none"
                        required
                      />
                      <button type="submit" className="px-3 py-1.5 bg-[#121212] text-white uppercase tracking-wider font-bold text-[10px] hover:bg-[#D43D2A]">
                        Log Postponement
                      </button>
                    </form>
                  )}

                  {showWalkoverInput && (
                    <form onSubmit={handleWalkoverMatch} className="mt-4 border border-[#E5E5E1] bg-white p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Award Walkover Victory</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Award Winner</label>
                          <select
                            value={walkoverWinnerId}
                            onChange={(e) => setWalkoverWinnerId(e.target.value)}
                            className="w-full border border-[#E5E5E1] bg-white px-2 py-1.5 text-xs"
                            required
                          >
                            <option value="">-- Select Award Winner --</option>
                            <option value={selectedMatch.home_team_id}>{matchHomeTeam.name}</option>
                            <option value={selectedMatch.away_team_id}>{matchAwayTeam.name}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Justification / Reason</label>
                          <input
                            type="text"
                            placeholder="e.g. Failure to field minimum 7 players"
                            value={walkoverReasonText}
                            onChange={(e) => setWalkoverReasonText(e.target.value)}
                            className="w-full border border-[#E5E5E1] px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="px-3 py-1.5 bg-[#121212] text-white uppercase tracking-wider font-bold text-[10px] hover:bg-[#D43D2A]">
                        Confirm Walkover
                      </button>
                    </form>
                  )}

                  {showCancelInput && (
                    <form onSubmit={handleCancelMatch} className="mt-4 border border-red-200 bg-red-50 p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-[#D43D2A]">Cancel Match</p>
                      <input
                        type="text"
                        placeholder="e.g. Severe weather conditions made play unsafe..."
                        value={cancelReasonText}
                        onChange={(e) => setCancelReasonText(e.target.value)}
                        className="w-full border border-red-200 bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1.5 bg-[#D43D2A] text-white uppercase tracking-wider font-bold text-[10px] hover:bg-red-700">
                          Confirm Cancellation
                        </button>
                        <button type="button" onClick={() => setShowCancelInput(false)} className="px-3 py-1.5 border border-red-200 text-[#D43D2A] uppercase tracking-wider font-bold text-[10px] hover:bg-red-100">
                          Dismiss
                        </button>
                      </div>
                    </form>
                  )}

                  {showAbandonInput && (
                    <form onSubmit={handleAbandonMatch} className="mt-4 border border-orange-200 bg-orange-50 p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-orange-700">Abandon Match</p>
                      <input
                        type="text"
                        placeholder="e.g. Pitch became unplayable due to waterlogging..."
                        value={abandonReasonText}
                        onChange={(e) => setAbandonReasonText(e.target.value)}
                        className="w-full border border-orange-200 bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white uppercase tracking-wider font-bold text-[10px] hover:bg-orange-700">
                          Confirm Abandonment
                        </button>
                        <button type="button" onClick={() => setShowAbandonInput(false)} className="px-3 py-1.5 border border-orange-200 text-orange-700 uppercase tracking-wider font-bold text-[10px] hover:bg-orange-100">
                          Dismiss
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Event timeline logger */}
                {(selectedMatch.status === 'kickoff' || selectedMatch.status === 'half_time' || selectedMatch.status === 'second_half') && (
                  <div className="border border-[#E5E5E1] bg-white p-6 rounded-none grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 border-r border-[#E5E5E1] pr-6 space-y-4">
                      <h4 className="text-[10px] uppercase tracking-wider text-[#121212] font-bold border-b border-[#E5E5E1] pb-2 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-[#D43D2A]" /> Log Live Event
                      </h4>

                      <form onSubmit={handleAddMatchEvent} className="space-y-4 font-sans text-xs">
                        <div>
                          <label className="block uppercase tracking-wider text-slate-400 mb-1.5 font-mono text-[9px] font-bold">
                            Event Minute (1 - 120)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={eventMinute}
                            onChange={(e) => setEventMinute(Number(e.target.value))}
                            className="w-full border border-[#E5E5E1] px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block uppercase tracking-wider text-slate-400 mb-1.5 font-mono text-[9px] font-bold">
                            Event Category
                          </label>
                          <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value as MatchEventType)}
                            className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                          >
                            <option value="goal">Goal scored</option>
                            <option value="penalty_scored">Penalty scored</option>
                            <option value="penalty_missed">Penalty missed</option>
                            <option value="own_goal">Own goal</option>
                            <option value="assist">Assist logged</option>
                            <option value="yellow_card">Yellow card caution</option>
                            <option value="red_card">Red card sending-off</option>
                            <option value="substitution">Player substitution</option>
                          </select>
                        </div>

                        <div>
                          <label className="block uppercase tracking-wider text-slate-400 mb-1.5 font-mono text-[9px] font-bold">
                            Select Involved Player
                          </label>
                          <select
                            value={eventPlayerId}
                            onChange={(e) => setEventPlayerId(e.target.value)}
                            className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                          >
                            <option value="">-- Select student --</option>
                            {activeMatchPlayers.map((p) => {
                              const t = teams.find((tm) => tm.id === p.teamId);
                              return (
                                <option key={p.id} value={p.id}>
                                  {p.firstName} {p.lastName} [{t ? t.name : 'Unknown'}]
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block uppercase tracking-wider text-slate-400 mb-1.5 font-mono text-[9px] font-bold">
                            Short Description / Note
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Header from corner kick..."
                            value={eventDesc}
                            onChange={(e) => setEventDesc(e.target.value)}
                            className="w-full border border-[#E5E5E1] px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#121212] text-white font-mono uppercase tracking-widest font-bold hover:bg-[#D43D2A] text-[9px]"
                        >
                          Record Match Event
                        </button>
                      </form>
                    </div>

                    {/* Timeline */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2">
                        Official Timeline {socketConnected && <span className="text-green-500">● LIVE</span>}
                      </h4>

                      {liveMatchEvents.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 italic font-serif">
                          No live match events recorded yet. Match kickoff initiated.
                        </div>
                      ) : (
                        <div className="relative border-l border-[#E5E5E1] ml-2 pl-4 space-y-5">
                          {[...liveMatchEvents]
                            .sort((a, b) => b.minute - a.minute)
                            .map((evt) => (
                              <div key={evt.id} className="relative group">
                                <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 bg-white border-2 border-[#D43D2A] rounded-none flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 bg-[#121212]" />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#D43D2A] block">
                                  {evt.minute}'
                                </span>
                                <p className="text-xs font-bold text-[#121212]">
                                  {evt.type.replace('_', ' ').toUpperCase()}
                                  {evt.player_id && ` • ${getPlayerName(evt.player_id)}`}
                                </p>
                                {evt.description && (
                                  <p className="text-[11px] text-slate-400 font-serif italic mt-0.5">
                                    "{evt.description}"
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-[#E5E5E1] p-12 text-center bg-white">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto stroke-1" />
                <p className="mt-4 text-sm font-serif italic text-slate-500">
                  {currentRole === 'official'
                    ? 'No matches assigned to you yet.'
                    : 'Select a fixture to initiate the Real-time Match Center controls.'}
                </p>
              </div>
            )}
          </div>

          {/* Right panel: standings */}
          <div className="space-y-6">
            <div className="border border-[#121212] bg-[#FBFBF9] p-6 rounded-none">
              <h3 className="text-xs uppercase tracking-wider text-[#121212] font-bold border-b border-[#121212] pb-3 flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-[#D43D2A]" /> Live Standings Feed
              </h3>
              <div className="mt-4 space-y-4">
                {competitions.map((comp) => {
                  const compStandings = mockDb.calculateStandings(comp.id);
                  return (
                    <div key={comp.id} className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 pb-1">
                        {comp.division || 'Division A'} • {comp.sport.toUpperCase()}
                      </p>
                      {compStandings.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No matches played yet.</p>
                      ) : (
                        <div className="divide-y divide-[#E5E5E1] text-[11px] font-sans">
                          {compStandings.slice(0, 4).map((std, i) => (
                            <div key={std.id} className="flex justify-between py-1.5 font-medium">
                              <span className="text-[#121212] truncate pr-4">
                                <span className="font-mono text-slate-400 font-normal mr-1.5">{i + 1}.</span>
                                {getTeamName(std.teamId)}
                              </span>
                              <span className="font-mono text-slate-500">
                                {std.played}P | <strong className="text-[#121212]">{std.points}pts</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'officials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                Registered District Referees
              </h2>
              <button
                onClick={() => setNewOffShow(!newOffShow)}
                className="editorial-btn-primary cursor-pointer py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Register Official
              </button>
            </div>

            {newOffShow && (
              <div className="border border-[#121212] bg-[#FBFBF9] p-5 rounded-none mb-6">
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2 mb-4">
                  Add Referee Profile
                </h4>
                <form onSubmit={handleAddOfficial} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">Full Name</label>
                    <input type="text" placeholder="e.g. Mark Clattenburg" value={newOffName} onChange={(e) => setNewOffName(e.target.value)} className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">District Email</label>
                    <input type="email" placeholder="clattenburg@referee.district.org" value={newOffEmail} onChange={(e) => setNewOffEmail(e.target.value)} className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">Phone Number (Optional)</label>
                    <input type="text" placeholder="+1 (555) 000-0000" value={newOffPhone} onChange={(e) => setNewOffPhone(e.target.value)} className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">Certifications (comma separated)</label>
                    <input type="text" placeholder="e.g. FIFA Badge, Varsity Chief" value={newOffCert} onChange={(e) => setNewOffCert(e.target.value)} className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setNewOffShow(false)} className="px-3 py-1.5 text-slate-500 hover:text-black cursor-pointer font-bold uppercase text-[10px]">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#121212] hover:bg-[#D43D2A] text-white uppercase font-bold tracking-wider text-[10px]">Save Official</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {officials.map((off) => (
                <div key={off.id} className="border border-[#E5E5E1] bg-white p-5 rounded-none relative hover:border-[#121212] transition-all">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleDeleteOfficial(off.id)} className="text-slate-400 hover:text-[#D43D2A] transition" title="De-register Official">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-9 w-9 border border-[#121212] bg-[#F1F1ED] flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 text-[#D43D2A]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#121212]">{off.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{off.email}</p>
                      {off.phone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{off.phone}</p>}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-1">
                    {off.certifications?.map((c, i) => (
                      <span key={i} className="inline-block bg-[#F1F1ED] text-[#121212] text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border border-[#E5E5E1] rounded-none">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-[#121212] bg-[#FBFBF9] p-6 rounded-none">
              <h3 className="text-xs uppercase tracking-wider text-[#121212] font-bold border-b border-[#121212] pb-3 flex items-center gap-2">
                <FileCheck className="h-4.5 w-4.5 text-[#D43D2A]" /> Officiating Handbook
              </h3>
              <ul className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">01.</span>
                  <span>Only registered and certified referees can be assigned to district fixtures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">02.</span>
                  <span>Match Events can only be logged live during active kickoffs. Full-time reports automatically lock the scoreboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">03.</span>
                  <span>Goals and cards logged in the Live Match center automatically synchronize standing statistics and disciplinary suspension bans.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
