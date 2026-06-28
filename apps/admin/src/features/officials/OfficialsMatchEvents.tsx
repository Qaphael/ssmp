/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Official, Fixture, Team, Player, MatchEvent, MatchEventType, Competition } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface OfficialsMatchEventsProps {
  officials: Official[];
  fixtures: Fixture[];
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matchEvents: MatchEvent[];
  onActionCompleted: () => void;
}

export default function OfficialsMatchEvents({
  officials,
  fixtures,
  teams,
  players,
  competitions,
  matchEvents,
  onActionCompleted,
}: OfficialsMatchEventsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'matchcenter' | 'officials'>('matchcenter');

  // Officials creation state
  const [newOffName, setNewOffName] = useState('');
  const [newOffEmail, setNewOffEmail] = useState('');
  const [newOffPhone, setNewOffPhone] = useState('');
  const [newOffCert, setNewOffCert] = useState('');
  const [newOffShow, setNewOffShow] = useState(false);

  // Live match center state
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [eventMinute, setEventMinute] = useState(1);
  const [eventType, setEventType] = useState<MatchEventType>('goal');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  // Lock status and results states
  const [showPostponeInput, setShowPostponeInput] = useState(false);
  const [postponeReasonText, setPostponeReasonText] = useState('');
  const [showWalkoverInput, setShowWalkoverInput] = useState(false);
  const [walkoverWinnerId, setWalkoverWinnerId] = useState('');
  const [walkoverReasonText, setWalkoverReasonText] = useState('');

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

  // Handlers for Officials
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

  // Handlers for Live Match Center
  const selectedFixture = fixtures.find((f) => f.id === selectedMatchId);
  const matchHomeTeam = selectedFixture ? teams.find((t) => t.id === selectedFixture.homeTeamId) : null;
  const matchAwayTeam = selectedFixture ? teams.find((t) => t.id === selectedFixture.awayTeamId) : null;

  // Get matching players for dropdown
  const activeMatchPlayers = players.filter(
    (p) =>
      selectedFixture &&
      (p.teamId === selectedFixture.homeTeamId || p.teamId === selectedFixture.awayTeamId)
  );

  const handleAssignReferee = (refId: string) => {
    if (!selectedFixture) return;
    mockDb.saveFixture({
      ...selectedFixture,
      officialId: refId || undefined,
    });
    onActionCompleted();
  };

  const handleUpdateStatus = (status: Fixture['status']) => {
    if (!selectedFixture) return;

    // Reset scores if kickoff is initiated
    const patch: Partial<Fixture> = { status };
    if (status === 'kickoff') {
      patch.homeScore = 0;
      patch.awayScore = 0;
      // Clear past match events
      mockDb.clearEventsForMatch(selectedFixture.id);
    }

    mockDb.saveFixture({
      ...selectedFixture,
      ...patch,
    });
    onActionCompleted();
  };

  const handleAddMatchEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture) return;

    // Determine team from player if not set
    let resolvedTeamId = eventTeamId;
    if (eventPlayerId && !resolvedTeamId) {
      const p = players.find((pl) => pl.id === eventPlayerId);
      if (p) {
        resolvedTeamId = p.teamId;
      }
    }

    // Save event
    mockDb.addEvent({
      matchId: selectedFixture.id,
      type: eventType,
      minute: Number(eventMinute),
      playerId: eventPlayerId || undefined,
      teamId: resolvedTeamId || undefined,
      description: eventDesc || undefined,
      recordedBy: 'system_admin',
    });

    // Automatically update match scores
    const updatedFixture = { ...selectedFixture };
    const hScore = updatedFixture.homeScore ?? 0;
    const aScore = updatedFixture.awayScore ?? 0;

    if (eventType === 'goal' || eventType === 'penalty_scored') {
      if (resolvedTeamId === selectedFixture.homeTeamId) {
        updatedFixture.homeScore = hScore + 1;
      } else if (resolvedTeamId === selectedFixture.awayTeamId) {
        updatedFixture.awayScore = aScore + 1;
      }
    } else if (eventType === 'own_goal') {
      // Own goal adds to opponent's score
      if (resolvedTeamId === selectedFixture.homeTeamId) {
        updatedFixture.awayScore = aScore + 1;
      } else if (resolvedTeamId === selectedFixture.awayTeamId) {
        updatedFixture.homeScore = hScore + 1;
      }
    }

    mockDb.saveFixture(updatedFixture);

    // Reset event inputs
    setEventPlayerId('');
    setEventDesc('');
    setEventMinute(eventMinute < 90 ? eventMinute + 5 : 90);
    onActionCompleted();
  };

  const handlePostponeMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture || !postponeReasonText) return;

    mockDb.saveFixture({
      ...selectedFixture,
      status: 'postponed',
      postponedReason: postponeReasonText,
    });

    setShowPostponeInput(false);
    setPostponeReasonText('');
    onActionCompleted();
  };

  const handleWalkoverMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture || !walkoverWinnerId) return;

    mockDb.saveFixture({
      ...selectedFixture,
      status: 'walkover',
      walkoverTeamId: walkoverWinnerId,
      walkoverReason: walkoverReasonText || 'Opposing team failed to produce compliant minimum roster size.',
    });

    setShowWalkoverInput(false);
    setWalkoverWinnerId('');
    setWalkoverReasonText('');
    onActionCompleted();
  };

  const selectedMatchEvents = matchEvents.filter((e) => e.matchId === selectedMatchId);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Page Header */}
      <div className="border-b border-[#121212] pb-4">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#121212]">
          Officials & <span className="text-[#D43D2A]">Match Center</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 font-bold leading-normal">
          Registry of certified referees and real-time live scorekeeping portal.
        </p>
      </div>

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
                Select Fixture to Administer
              </h2>
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
                {fixtures.map((f) => (
                  <option key={f.id} value={f.id}>
                    Matchday {f.matchday} • {getTeamName(f.homeTeamId)} vs {getTeamName(f.awayTeamId)} [
                    {f.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {selectedFixture && matchHomeTeam && matchAwayTeam ? (
              <div className="space-y-6">
                {/* Scoreboard block */}
                <div className="border border-[#121212] bg-white p-6 relative rounded-none shadow-sm text-center">
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-[#121212]" />

                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    {getCompName(selectedFixture.competitionId)} • Matchday {selectedFixture.matchday}
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
                        {selectedFixture.status === 'scheduled' || selectedFixture.status === 'postponed' ? (
                          <span className="text-sm font-sans uppercase font-bold tracking-widest text-slate-400">
                            VS
                          </span>
                        ) : (
                          `${selectedFixture.homeScore ?? 0} - ${selectedFixture.awayScore ?? 0}`
                        )}
                      </div>
                      <span className="mt-2 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border bg-red-50 text-[#D43D2A] border-red-100 font-mono animate-pulse">
                        {selectedFixture.status}
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
                      <strong className="text-[#121212] font-mono">{getOfficialName(selectedFixture.officialId)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Assign Referee:</label>
                      <select
                        value={selectedFixture.officialId || ''}
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
                  </div>
                </div>

                {/* Match Status transitions */}
                <div className="border border-[#E5E5E1] bg-[#FBFBF9] p-5 rounded-none space-y-4">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2">
                    Supervisor Match Status Transitions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFixture.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus('kickoff')}
                        className="px-4 py-2 bg-[#121212] hover:bg-[#D43D2A] text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Initiate Kickoff (Live)
                      </button>
                    )}

                    {selectedFixture.status === 'kickoff' && (
                      <button
                        onClick={() => handleUpdateStatus('full_time')}
                        className="px-4 py-2 bg-[#D43D2A] hover:bg-red-700 text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        End Match (Full Time)
                      </button>
                    )}

                    {(selectedFixture.status === 'full_time' || selectedFixture.status === 'walkover') && (
                      <button
                        onClick={() => handleUpdateStatus('scheduled')}
                        className="px-4 py-2 border border-slate-300 hover:border-[#121212] text-slate-600 hover:text-black text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        Reset to Scheduled
                      </button>
                    )}

                    {selectedFixture.status !== 'postponed' && selectedFixture.status !== 'full_time' && (
                      <button
                        onClick={() => {
                          setShowPostponeInput(!showPostponeInput);
                          setShowWalkoverInput(false);
                        }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-amber-400 hover:text-amber-700 text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Postpone Match
                      </button>
                    )}

                    {selectedFixture.status !== 'full_time' && selectedFixture.status !== 'walkover' && (
                      <button
                        onClick={() => {
                          setShowWalkoverInput(!showWalkoverInput);
                          setShowPostponeInput(false);
                        }}
                        className="px-4 py-2 border border-[#E5E5E1] hover:border-red-400 hover:text-[#D43D2A] text-slate-500 text-[10px] uppercase tracking-wider font-bold transition cursor-pointer bg-white"
                      >
                        Declare Walkover
                      </button>
                    )}
                  </div>

                  {/* Postpone reason form */}
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
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#121212] text-white uppercase tracking-wider font-bold text-[10px] hover:bg-[#D43D2A]"
                      >
                        Log Postponement
                      </button>
                    </form>
                  )}

                  {/* Walkover awards form */}
                  {showWalkoverInput && (
                    <form onSubmit={handleWalkoverMatch} className="mt-4 border border-[#E5E5E1] bg-white p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Award Walkover Victory</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">
                            Award Winner
                          </label>
                          <select
                            value={walkoverWinnerId}
                            onChange={(e) => setWalkoverWinnerId(e.target.value)}
                            className="w-full border border-[#E5E5E1] bg-white px-2 py-1.5 text-xs"
                            required
                          >
                            <option value="">-- Select Award Winner --</option>
                            <option value={selectedFixture.homeTeamId}>{matchHomeTeam.name}</option>
                            <option value={selectedFixture.awayTeamId}>{matchAwayTeam.name}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">
                            Justification / Reason
                          </label>
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
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#121212] text-white uppercase tracking-wider font-bold text-[10px] hover:bg-[#D43D2A]"
                      >
                        Confirm Walkover
                      </button>
                    </form>
                  )}
                </div>

                {/* Event timeline logger */}
                {selectedFixture.status === 'kickoff' && (
                  <div className="border border-[#E5E5E1] bg-white p-6 rounded-none grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add match event form */}
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

                    {/* Timeline representation */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2">
                        Official Timeline
                      </h4>

                      {selectedMatchEvents.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 italic font-serif">
                          No live match events recorded yet. Match kickoff initiated.
                        </div>
                      ) : (
                        <div className="relative border-l border-[#E5E5E1] ml-2 pl-4 space-y-5">
                          {selectedMatchEvents
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
                                  {evt.playerId && ` • ${getPlayerName(evt.playerId)}`}
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
                  Select a fixture to initiate the Real-time Match Center controls.
                </p>
              </div>
            )}
          </div>

          {/* Quick Standings side-panel */}
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
          {/* List of active officials */}
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
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mark Clattenburg"
                      value={newOffName}
                      onChange={(e) => setNewOffName(e.target.value)}
                      className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">
                      District Email
                    </label>
                    <input
                      type="email"
                      placeholder="clattenburg@referee.district.org"
                      value={newOffEmail}
                      onChange={(e) => setNewOffEmail(e.target.value)}
                      className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={newOffPhone}
                      onChange={(e) => setNewOffPhone(e.target.value)}
                      className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono">
                      Certifications (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FIFA Badge, Varsity Chief"
                      value={newOffCert}
                      onChange={(e) => setNewOffCert(e.target.value)}
                      className="w-full border border-[#E5E5E1] bg-white px-3 py-1.5 text-xs focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewOffShow(false)}
                      className="px-3 py-1.5 text-slate-500 hover:text-black cursor-pointer font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#121212] hover:bg-[#D43D2A] text-white uppercase font-bold tracking-wider text-[10px]"
                    >
                      Save Official
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {officials.map((off) => (
                <div
                  key={off.id}
                  className="border border-[#E5E5E1] bg-white p-5 rounded-none relative hover:border-[#121212] transition-all"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleDeleteOfficial(off.id)}
                      className="text-slate-400 hover:text-[#D43D2A] transition"
                      title="De-register Official"
                    >
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
                      <span
                        key={i}
                        className="inline-block bg-[#F1F1ED] text-[#121212] text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border border-[#E5E5E1] rounded-none"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick guide panel */}
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
