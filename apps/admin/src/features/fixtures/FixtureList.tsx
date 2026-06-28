/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Clock,
  MapPin,
  RefreshCw,
  Trophy,
  CheckCircle,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { Fixture, Team, Pitch, Competition } from '@ssmp/shared-types';
import { mockDb, detectConflicts, ConflictWarning } from '../../shared/api/mockDb';

interface FixtureListProps {
  fixtures: Fixture[];
  teams: Team[];
  pitches: Pitch[];
  competitions: Competition[];
  onFixtureChanged: () => void;
}

export default function FixtureList({
  fixtures,
  teams,
  pitches,
  competitions,
  onFixtureChanged,
}: FixtureListProps) {
  // Filters
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedMatchday, setSelectedMatchday] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Modal control
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

  // Form states
  const [formCompId, setFormCompId] = useState(competitions[0]?.id || 'comp-u17-football');
  const [formMatchday, setFormMatchday] = useState(1);
  const [formHomeTeam, setFormHomeTeam] = useState('');
  const [formAwayTeam, setFormAwayTeam] = useState('');
  const [formScheduledAt, setFormScheduledAt] = useState('2026-09-10T14:00');
  const [formPitchId, setFormPitchId] = useState(pitches[0]?.id || '');

  // Filter calculations
  const matchdays = Array.from(new Set(fixtures.map((f) => f.matchday))).sort((a, b) => a - b);

  const filteredFixtures = fixtures.filter((f) => {
    const comp = competitions.find((c) => c.id === f.competitionId);
    const home = teams.find((t) => t.id === f.homeTeamId);
    const away = teams.find((t) => t.id === f.awayTeamId);
    const pitch = pitches.find((p) => p.id === f.pitchId);

    const matchesComp = selectedComp === 'all' || f.competitionId === selectedComp;
    const matchesMatchday = selectedMatchday === 'all' || f.matchday === parseInt(selectedMatchday);

    // Search query matching team names, school names, pitch, or date details
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const homeName = (home?.name || '').toLowerCase();
      const homeSchool = (home?.schoolName || '').toLowerCase();
      const awayName = (away?.name || '').toLowerCase();
      const awaySchool = (away?.schoolName || '').toLowerCase();
      const pitchName = (pitch?.name || 'field unassigned').toLowerCase();
      
      // Date string matching
      const dateObj = new Date(f.scheduledAt);
      const dateFormatted = dateObj.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).toLowerCase();
      const isoDate = f.scheduledAt.toLowerCase();

      matchesSearch = 
        homeName.includes(q) ||
        homeSchool.includes(q) ||
        awayName.includes(q) ||
        awaySchool.includes(q) ||
        pitchName.includes(q) ||
        dateFormatted.includes(q) ||
        isoDate.includes(q);
    }

    // Specific date filter matching (Y-M-D comparison)
    let matchesDateFilter = true;
    if (selectedDate !== '') {
      const filterDateStr = new Date(selectedDate).toDateString();
      const fixtureDateStr = new Date(f.scheduledAt).toDateString();
      matchesDateFilter = filterDateStr === fixtureDateStr;
    }

    return matchesComp && matchesMatchday && matchesSearch && matchesDateFilter;
  });

  // Conflicts calculation
  const conflicts = detectConflicts(fixtures, competitions);

  // Initialize add form
  const openAddModal = () => {
    setEditingFixture(null);
    setFormCompId(competitions[0]?.id || '');
    setFormMatchday(1);
    const eligibleTeams = teams.filter((t) => t.registrationStatus === 'approved');
    setFormHomeTeam(eligibleTeams[0]?.id || '');
    setFormAwayTeam(eligibleTeams[1]?.id || '');
    setFormScheduledAt('2026-09-10T14:00');
    setFormPitchId(pitches[0]?.id || '');
    setShowAddModal(true);
  };

  // Initialize edit form
  const openEditModal = (fixture: Fixture) => {
    setEditingFixture(fixture);
    setFormCompId(fixture.competitionId);
    setFormMatchday(fixture.matchday);
    setFormHomeTeam(fixture.homeTeamId);
    setFormAwayTeam(fixture.awayTeamId);

    // Convert date to local string for input datetime-local
    const d = new Date(fixture.scheduledAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    setFormScheduledAt(`${year}-${month}-${day}T${hours}:${minutes}`);

    setFormPitchId(fixture.pitchId || '');
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this fixture?')) {
      mockDb.deleteFixture(id);
      onFixtureChanged();
    }
  };

  const handleSaveFixture = (e: React.FormEvent) => {
    e.preventDefault();

    if (formHomeTeam === formAwayTeam) {
      alert('Home and Away teams must be different.');
      return;
    }

    mockDb.saveFixture({
      id: editingFixture?.id,
      competitionId: formCompId,
      matchday: formMatchday,
      homeTeamId: formHomeTeam,
      awayTeamId: formAwayTeam,
      scheduledAt: new Date(formScheduledAt).toISOString(),
      pitchId: formPitchId,
      status: 'scheduled',
    });

    setShowAddModal(false);
    onFixtureChanged();
  };

  // Automated Quick Fix Resolution Engine for overlaps!
  // Shifting clashing slots sequentially clears conflicts automatically.
  const handleAutoResolveConflicts = () => {
    if (conflicts.length === 0) return;

    let modified = false;
    const currentFixtures = [...fixtures];

    // Find overlapping items
    conflicts.forEach((conflict) => {
      const fix = currentFixtures.find((f) => f.id === conflict.fixtureId);
      if (!fix) return;

      if (conflict.type === 'pitch_clash') {
        // Resolve Pitch Clash by shifting the clashing match slot to a later slot
        // Let's add 2 hours (120 min) to avoid overlaps
        const originalTime = new Date(fix.scheduledAt).getTime();
        const resolvedTime = new Date(originalTime + 120 * 60 * 1000); // Shift forward by 2 hours
        fix.scheduledAt = resolvedTime.toISOString();
        mockDb.saveFixture(fix);
        modified = true;
      } else if (conflict.type === 'team_double_booking') {
        // Resolve double booking by shifting date forward by 1 day
        const originalTime = new Date(fix.scheduledAt).getTime();
        const resolvedTime = new Date(originalTime + 24 * 60 * 60 * 1000); // shift forward 1 day
        fix.scheduledAt = resolvedTime.toISOString();
        mockDb.saveFixture(fix);
        modified = true;
      }
    });

    if (modified) {
      alert('⚡ Magic Clash Resolver applied! Overlapping schedules have been shifted to subsequent available slots.');
      onFixtureChanged();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E5E1] pb-6">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D43D2A]" />
            Match Schedule & Venues
          </h1>
          <p className="text-xs text-[#8b8b85] mt-1 font-medium font-sans">
            Design matchday brackets, coordinate available pitches, and rectify booking conflicts instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {conflicts.length > 0 && (
            <button
              onClick={handleAutoResolveConflicts}
              className="inline-flex items-center gap-1.5 rounded-none bg-[#D43D2A] border border-[#D43D2A] px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase text-white hover:bg-[#121212] transition-colors cursor-pointer animate-pulse"
              id="quick-resolve-clashes-btn"
            >
              <Sparkles className="h-4 w-4" /> Quick Resolve Clashes
            </button>
          )}

          <button
            onClick={openAddModal}
            className="editorial-btn-accent inline-flex items-center gap-1.5 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
            id="add-fixture-btn"
          >
            <Plus className="h-4 w-4" /> Schedule Match
          </button>
        </div>
      </div>

      {/* Clash Notification banners if any exist */}
      {conflicts.length > 0 && (
        <div className="rounded-none border-t-2 border-t-[#D43D2A] border-x border-b border-[#E5E5E1] bg-rose-50/50 p-5 font-sans">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#D43D2A] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-bold text-[#D43D2A] uppercase tracking-wider">
                Schedule Conflict Warnings Detected ({conflicts.length})
              </h3>
              <p className="mt-1 text-xs text-rose-700 leading-normal">
                Matches are currently overlapping on the same field or involving identical teams at the same hour. Fix them below manually or hit the <strong>Quick Resolve</strong> assistant.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="space-y-4 rounded-none border border-[#E5E5E1] bg-[#FBFBF9] p-5 font-sans shadow-xs">
        {/* Search input for team name, pitch, date */}
        <div className="relative flex items-center">
          <Search className="absolute left-4.5 h-4 w-4 text-[#8b8b85]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fixtures by team name, school, pitch venue, or date..."
            className="w-full rounded-none border border-[#E5E5E1] bg-white py-3 pl-12 pr-10 text-xs text-[#121212] placeholder-slate-400 focus:border-[#121212] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-[#121212] transition cursor-pointer"
              title="Clear search"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-center">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-3.5 w-3.5 text-[#8b8b85] shrink-0" />
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-none cursor-pointer text-[#121212] font-semibold"
            >
              <option value="all">All Competitions</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="h-3.5 w-3.5 text-[#8b8b85] shrink-0" />
            <select
              value={selectedMatchday}
              onChange={(e) => setSelectedMatchday(e.target.value)}
              className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-none cursor-pointer text-[#121212] font-semibold"
            >
              <option value="all">All Matchdays</option>
              {matchdays.map((m) => (
                <option key={m} value={m}>
                  Matchday {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar className="h-3.5 w-3.5 text-[#8b8b85] shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-none border border-[#E5E5E1] p-2 text-xs bg-white focus:border-[#121212] focus:outline-none cursor-pointer text-[#121212] font-mono h-[38px] font-semibold"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="p-1 text-slate-400 hover:text-[#D43D2A] transition cursor-pointer"
                title="Clear date filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 lg:col-span-1 border-t border-dashed border-[#E5E5E1] pt-3 sm:border-0 sm:pt-0">
            {(searchQuery || selectedComp !== 'all' || selectedMatchday !== 'all' || selectedDate) ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedComp('all');
                  setSelectedMatchday('all');
                  setSelectedDate('');
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-[#D43D2A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Reset Filters
              </button>
            ) : <span />}

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b8b85]">
              Matches Found: {filteredFixtures.length}
            </span>
          </div>
        </div>
      </div>

      {/* Fixture Schedule Stream */}
      {filteredFixtures.length === 0 ? (
        <div className="rounded-none border border-dashed border-[#E5E5E1] bg-white py-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-[#8b8b85]" />
          <h3 className="mt-4 text-sm font-serif italic font-bold text-[#121212]">No Matches Scheduled</h3>
          <p className="mt-1 text-xs text-slate-400">
            No matches meet the current filters. Hit "Schedule Match" to deploy brackets.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFixtures.map((fixture) => {
            const comp = competitions.find((c) => c.id === fixture.competitionId);
            const home = teams.find((t) => t.id === fixture.homeTeamId);
            const away = teams.find((t) => t.id === fixture.awayTeamId);
            const pitch = pitches.find((p) => p.id === fixture.pitchId);

            const hasConflict = conflicts.filter((c) => c.fixtureId === fixture.id);

            return (
              <div
                key={fixture.id}
                className={`flex flex-col justify-between gap-4 rounded-none border p-6 transition-all md:flex-row md:items-center ${
                  hasConflict.length > 0
                    ? 'border-[#D43D2A] bg-rose-50/10'
                    : 'border-[#E5E5E1] bg-white hover:border-[#121212]'
                }`}
                id={`fixture-card-${fixture.id}`}
              >
                {/* Match details block */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-none bg-[#FBFBF9] border border-[#E5E5E1] px-2 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                      {comp?.name || 'League Cup'}
                    </span>
                    <span className="rounded-none bg-[#121212]/10 border border-[#121212]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                      Matchday {fixture.matchday}
                    </span>

                    {hasConflict.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-none bg-[#D43D2A]/10 border border-[#D43D2A]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#D43D2A] uppercase tracking-wider animate-pulse">
                        <AlertTriangle className="h-3 w-3" /> Schedule Clashes Found
                      </span>
                    )}
                  </div>

                  {/* Competitor teams */}
                  <div className="flex items-center gap-3 text-base">
                    <span className="font-serif italic font-bold text-[#121212]">
                      {home?.name || 'Home Pool'}
                    </span>
                    <span className="text-xs font-bold text-[#8b8b85] uppercase font-sans">vs</span>
                    <span className="font-serif italic font-bold text-[#121212]">
                      {away?.name || 'Away Pool'}
                    </span>
                  </div>

                  {/* Pitch and timing details */}
                  <div className="flex flex-col gap-x-4 gap-y-1.5 text-xs text-[#8b8b85] sm:flex-row font-sans font-medium mt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#8b8b85]" />
                      {new Date(fixture.scheduledAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#8b8b85]" />
                      {pitch?.name || 'Field unassigned'}
                    </span>
                  </div>

                  {/* Details of clashing problems */}
                  {hasConflict.map((warn, wIdx) => (
                    <div
                      key={wIdx}
                      className="flex items-center gap-2 rounded-none bg-rose-50 px-3.5 py-2.5 border border-rose-200 text-[10px] font-bold text-[#D43D2A] uppercase tracking-wide mt-2"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{warn.message}</span>
                    </div>
                  ))}
                </div>

                {/* Fixture admin actions */}
                <div className="flex items-center gap-2 border-t border-[#E5E5E1] pt-4 md:border-t-0 md:pt-0 shrink-0">
                  <button
                    onClick={() => openEditModal(fixture)}
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-[#E5E5E1] bg-white text-[#121212] hover:bg-[#FBFBF9] transition cursor-pointer"
                    title="Reschedule Match"
                    id={`edit-fixture-btn-${fixture.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(fixture.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-none border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Fixture"
                    id={`delete-fixture-btn-${fixture.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Fixture Modal */}
      {showAddModal && (() => {
        const eligibleTeams = teams.filter((t) => t.registrationStatus === 'approved');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-none bg-white p-6 md:p-8 border border-[#E5E5E1] shadow-none font-sans">
              <h3 className="text-lg font-serif italic font-bold text-[#121212]">
                {editingFixture ? 'Reschedule Match fixture' : 'Schedule New Match'}
              </h3>
              <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
                Formulate bracket parameters to fit available stadium locations.
              </p>

              <form onSubmit={handleSaveFixture} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="form-comp" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Tournament Group
                  </label>
                  <select
                    id="form-comp"
                    value={formCompId}
                    onChange={(e) => setFormCompId(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                  >
                    {competitions.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="form-matchday" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Matchday Round
                    </label>
                    <input
                      id="form-matchday"
                      type="number"
                      min="1"
                      required
                      value={formMatchday}
                      onChange={(e) => setFormMatchday(parseInt(e.target.value) || 1)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="form-pitch" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Venue Location
                    </label>
                    <select
                      id="form-pitch"
                      value={formPitchId}
                      onChange={(e) => setFormPitchId(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Unassigned Location</option>
                      {pitches.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="form-home" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Home Competitor
                    </label>
                    <select
                      id="form-home"
                      value={formHomeTeam}
                      onChange={(e) => setFormHomeTeam(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Select Home Team</option>
                      {eligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.schoolName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="form-away" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Away Competitor
                    </label>
                    <select
                      id="form-away"
                      value={formAwayTeam}
                      onChange={(e) => setFormAwayTeam(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Select Away Team</option>
                      {eligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.schoolName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="form-schedule" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Scheduled At (Date & Time)
                  </label>
                  <input
                    id="form-schedule"
                    type="datetime-local"
                    required
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden font-mono cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="editorial-btn-accent text-[10px] uppercase tracking-widest font-bold py-2.5 px-4 cursor-pointer"
                    id="submit-fixture-form-btn"
                  >
                    {editingFixture ? 'Apply Reschedule' : 'Publish Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
