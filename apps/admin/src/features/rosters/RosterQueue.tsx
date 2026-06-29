/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Check,
  X,
  Search,
  ChevronRight,
  Shield,
  Eye,
  AlertCircle,
  Activity,
  Plus,
  ArrowRight,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import { RosterSubmission, Team, Player, Competition } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface RosterQueueProps {
  rosters: RosterSubmission[];
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  onReviewCompleted: () => void;
}

export default function RosterQueue({
  rosters,
  teams,
  players,
  competitions,
  onReviewCompleted,
}: RosterQueueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('submitted');

  // Detail Modal state
  const [activeRosterId, setActiveRosterId] = useState<string | null>(null);

  // Rejection feedback state
  const [rejectingRosterId, setRejectingRosterId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Add simulated player to team
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<string | null>(null); // TeamId
  const [newPlayerFirst, setNewPlayerFirst] = useState('');
  const [newPlayerLast, setNewPlayerLast] = useState('');
  const [newPlayerJersey, setNewPlayerJersey] = useState(11);
  const [newPlayerPos, setNewPlayerPos] = useState('forward');
  const [newPlayerDOB, setNewPlayerDOB] = useState('2010-01-01');
  const [newPlayerNat, setNewPlayerNat] = useState('District Local');

  // Injury tracking state
  const [injuryPlayerId, setInjuryPlayerId] = useState<string | null>(null);
  const [injuryDescription, setInjuryDescription] = useState('');
  const [injuryReturnDate, setInjuryReturnDate] = useState('');
  const [injuryMedicalNotes, setInjuryMedicalNotes] = useState('');

  // Filter rosters
  const filteredRosters = rosters.filter((ros) => {
    const team = teams.find((t) => t.id === ros.teamId);
    if (!team) return false;

    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesComp = selectedComp === 'all' || ros.competitionId === selectedComp;
    const matchesStatus = selectedStatus === 'all' || ros.status === selectedStatus;

    return matchesSearch && matchesComp && matchesStatus;
  });

  const handleApprove = (id: string) => {
    mockDb.reviewRoster(id, 'approved');
    setActiveRosterId(null);
    onReviewCompleted();
  };

  const handleStartReject = (id: string) => {
    setRejectingRosterId(id);
    setRejectionReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    if (rejectingRosterId) {
      mockDb.reviewRoster(rejectingRosterId, 'rejected', rejectionReason);
      setRejectingRosterId(null);
      setActiveRosterId(null);
      onReviewCompleted();
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const teamId = showAddPlayerModal;
    if (!teamId || !newPlayerFirst.trim() || !newPlayerLast.trim()) {
      alert('Please complete player name fields.');
      return;
    }

    // Add Player to Db
    const addedPlayer = mockDb.addSamplePlayer({
      teamId,
      firstName: newPlayerFirst.trim(),
      lastName: newPlayerLast.trim(),
      jerseyNumber: newPlayerJersey,
      position: newPlayerPos,
      dateOfBirth: newPlayerDOB,
      nationality: newPlayerNat,
      status: 'active',
    });

    // Update the roster submission playerIds array
    const allRosters = mockDb.getRosters();
    const targetRoster = allRosters.find((r) => r.teamId === teamId);
    if (targetRoster) {
      if (!targetRoster.playerIds.includes(addedPlayer.id)) {
        targetRoster.playerIds.push(addedPlayer.id);
        // Put back in draft or submitted
        targetRoster.status = 'submitted';
        localStorage.setItem('sm_rosters', JSON.stringify(allRosters));
      }
    } else {
      // Create new roster submission
      const activeTeam = teams.find((t) => t.id === teamId);
      if (activeTeam) {
        const newSubmission: RosterSubmission = {
          id: `roster-${Math.random().toString(36).substring(2, 9)}`,
          teamId,
          competitionId: activeTeam.competitionId,
          playerIds: [addedPlayer.id],
          status: 'submitted',
          submittedBy: 'coach-simulated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        allRosters.push(newSubmission);
        localStorage.setItem('sm_rosters', JSON.stringify(allRosters));
      }
    }

    // Update Team Roster Status to submitted
    const allTeams = mockDb.getTeams();
    const tIdx = allTeams.findIndex((t) => t.id === teamId);
    if (tIdx !== -1) {
      allTeams[tIdx].rosterApprovalStatus = 'submitted';
      localStorage.setItem('sm_teams', JSON.stringify(allTeams));
    }

    // Clean states
    setNewPlayerFirst('');
    setNewPlayerLast('');
    setNewPlayerJersey(10);
    setShowAddPlayerModal(null);
    onReviewCompleted();
  };

  // Injury handlers
  const handleMarkInjured = (playerId: string) => {
    setInjuryPlayerId(playerId);
    setInjuryDescription('');
    setInjuryReturnDate('');
    setInjuryMedicalNotes('');
  };

  const handleConfirmInjury = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injuryPlayerId || !injuryDescription.trim() || !injuryReturnDate) return;

    mockDb.updatePlayer(injuryPlayerId, {
      status: 'injured',
      injuryDetails: {
        description: injuryDescription.trim(),
        expectedReturnDate: injuryReturnDate,
        medicalNotes: injuryMedicalNotes.trim() || undefined,
      },
    });

    setInjuryPlayerId(null);
    onReviewCompleted();
  };

  const handleClearInjury = (playerId: string) => {
    mockDb.updatePlayer(playerId, {
      status: 'active',
      injuryDetails: undefined,
    });
    onReviewCompleted();
  };

  const pendingRosterCount = rosters.filter((r) => r.status === 'submitted').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-[#E5E5E1] pb-6">
        <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-[#D43D2A]" />
          Roster Approval Queue
        </h1>
        <p className="text-xs text-[#8b8b85] mt-1 font-medium font-sans">
          Verify district participant age compliance, jersey duplication checks, and position validations before rosters lock.
        </p>
      </div>

      {/* Toolbar Filter */}
      <div className="grid grid-cols-1 gap-4 rounded-none border border-[#E5E5E1] bg-[#FBFBF9] p-4 md:grid-cols-4 font-sans">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8b8b85]" />
          <input
            type="text"
            placeholder="Search school or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-none border border-[#E5E5E1] pl-9 pr-4 py-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-[#8b8b85]" />
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Competitions</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-[#8b8b85]" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
          >
            <option value="submitted">Submitted Only ({pendingRosterCount})</option>
            <option value="approved">Approved rosters</option>
            <option value="rejected">Rejected rosters</option>
            <option value="all">All statuses</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b8b85] font-sans">
            Showing {filteredRosters.length} roster(s)
          </span>
        </div>
      </div>

      {/* Roster Stream cards */}
      {filteredRosters.length === 0 ? (
        <div className="rounded-none border border-dashed border-[#E5E5E1] bg-white py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-[#8b8b85]" />
          <h3 className="mt-4 text-sm font-serif italic font-bold text-[#121212]">No Rosters found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto font-medium">
            Adjust filters to find rosters or use "Add Player" simulation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRosters.map((ros) => {
            const team = teams.find((t) => t.id === ros.teamId);
            const comp = competitions.find((c) => c.id === ros.competitionId);
            if (!team) return null;

            return (
              <div
                key={ros.id}
                className={`flex flex-col justify-between rounded-none border p-6 transition-all bg-white ${
                  ros.status === 'submitted'
                    ? 'border-[#E5E5E1] border-l-4 border-l-[#D43D2A]'
                    : ros.status === 'approved'
                    ? 'border-[#E5E5E1] border-l-4 border-l-[#121212]'
                    : 'border-[#E5E5E1] opacity-90'
                }`}
                id={`roster-card-${ros.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-none bg-[#FBFBF9] border border-[#E5E5E1] px-2 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                      {comp?.name || 'District Cup'}
                    </span>

                    {ros.status === 'submitted' && (
                      <span className="rounded-none bg-[#D43D2A]/10 border border-[#D43D2A]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#D43D2A] uppercase tracking-wider">
                        Review Needed
                      </span>
                    )}
                    {ros.status === 'approved' && (
                      <span className="rounded-none bg-[#121212]/10 border border-[#121212]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                        Approved
                      </span>
                    )}
                    {ros.status === 'rejected' && (
                      <span className="rounded-none bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-bold text-rose-800 uppercase tracking-wider">
                        Rejected
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-serif italic font-bold text-[#121212]">{team.name}</h3>
                    <p className="text-xs text-[#8b8b85] font-medium font-sans">{team.schoolName}</p>
                  </div>

                  <div className="rounded-none bg-[#FBFBF9] p-4 flex justify-between items-center border border-[#E5E5E1]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#8b8b85]" />
                      <span className="text-xs font-bold text-[#121212]">
                        {ros.playerIds.length} Registered Athlete(s)
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveRosterId(ros.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#D43D2A] hover:text-[#121212] transition cursor-pointer"
                      id={`view-players-link-${ros.id}`}
                    >
                      <Eye className="h-3.5 w-3.5" /> Review Players
                    </button>
                  </div>

                  {ros.status === 'rejected' && ros.rejectionReason && (
                    <div className="flex items-start gap-1.5 rounded-none bg-rose-50 p-3 border border-rose-100 text-[11px] text-rose-700 font-sans">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p>
                        <strong className="font-bold uppercase tracking-wider text-[9px]">Rejection reason:</strong> {ros.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E1] pt-4">
                  <button
                    onClick={() => setShowAddPlayerModal(team.id)}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#121212] hover:text-[#D43D2A] transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Player
                  </button>

                  {ros.status === 'submitted' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartReject(ros.id)}
                        className="rounded-none border border-rose-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(ros.id)}
                        className="editorial-btn-primary flex py-2 px-3 text-[10px] tracking-widest uppercase cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roster Detailed Modal Sheet */}
      {activeRosterId && (() => {
        const activeRos = rosters.find((r) => r.id === activeRosterId);
        const team = activeRos ? teams.find((t) => t.id === activeRos.teamId) : null;
        const rosPlayers = activeRos ? players.filter((p) => activeRos.playerIds.includes(p.id)) : [];

        if (!activeRos || !team) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-3xl rounded-none bg-white p-6 md:p-8 border border-[#E5E5E1] shadow-none flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#E5E5E1] pb-4">
                <div>
                  <h3 className="text-xl font-serif italic font-bold text-[#121212] flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-[#D43D2A]" />
                    Athlete Roster Review: {team.name}
                  </h3>
                  <p className="text-xs text-[#8b8b85] font-medium font-sans mt-0.5">
                    {team.schoolName} • {activeRos.playerIds.length} Registered Players
                  </p>
                </div>
                <button
                  onClick={() => setActiveRosterId(null)}
                  className="rounded-none p-1.5 hover:bg-[#FBFBF9] border border-[#E5E5E1] cursor-pointer"
                >
                  <X className="h-4 w-4 text-[#8b8b85]" />
                </button>
              </div>

              {/* Player Table list */}
              <div className="flex-1 overflow-y-auto py-4">
                {rosPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-[#8b8b85] mx-auto" />
                    <p className="mt-2 text-xs font-serif italic font-bold text-[#121212]">Roster list is empty</p>
                    <p className="text-[11px] text-slate-400">Add players using the trigger card outside.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-none border border-[#E5E5E1]">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-[#FBFBF9] border-b border-[#E5E5E1] text-[9px] font-bold uppercase tracking-widest text-[#8b8b85]">
                          <th className="px-4 py-3.5 w-16 text-center">No.</th>
                          <th className="px-4 py-3.5">Athlete Name</th>
                          <th className="px-4 py-3.5">Position</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5">Date of Birth</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E1] text-xs text-[#121212]">
                        {rosPlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-[#FBFBF9]/50 transition-colors">
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex h-6 w-6 items-center justify-center bg-[#121212] font-mono font-bold text-white text-[11px] rounded-none">
                                {player.jerseyNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-serif italic font-bold text-[#121212] text-sm">
                              {player.firstName} {player.lastName}
                            </td>
                            <td className="px-4 py-3 capitalize text-slate-600 font-medium">
                              {player.position || 'all-round'}
                            </td>
                            <td className="px-4 py-3">
                              {player.status === 'injured' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider border border-red-200">
                                  <HeartPulse className="h-3 w-3" />
                                  Injured
                                </span>
                              ) : player.status === 'suspended' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                                  Active
                                </span>
                              )}
                              {player.status === 'injured' && player.injuryDetails && (
                                <p className="mt-1 text-[9px] text-slate-500 font-mono">
                                  Return: {player.injuryDetails.expectedReturnDate}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#8b8b85] font-mono">
                              {new Date(player.dateOfBirth).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {player.status === 'injured' ? (
                                <button
                                  onClick={() => handleClearInjury(player.id)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-green-600 hover:text-green-800 cursor-pointer"
                                >
                                  Clear
                                </button>
                              ) : player.status === 'active' ? (
                                <button
                                  onClick={() => handleMarkInjured(player.id)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 cursor-pointer"
                                >
                                  Mark Injured
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-[#E5E5E1] pt-4 mt-auto">
                <span className="text-[10px] text-[#8b8b85] font-bold uppercase tracking-widest font-mono">
                  Compliance: Status {activeRos.status.toUpperCase()}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveRosterId(null)}
                    className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                  >
                    Close Sheet
                  </button>

                  {activeRos.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => handleStartReject(activeRos.id)}
                        className="rounded-none border border-rose-200 bg-rose-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-700 hover:bg-rose-100 cursor-pointer"
                        id="sheet-reject-roster-btn"
                      >
                        Reject Roster
                      </button>
                      <button
                        onClick={() => handleApprove(activeRos.id)}
                        className="editorial-btn-primary cursor-pointer text-[10px] uppercase tracking-widest py-2.5 px-4"
                        id="sheet-approve-roster-btn"
                      >
                        Approve Compliance
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reject Roster Dialog */}
      {rejectingRosterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-none bg-white p-6 border border-[#E5E5E1] shadow-none">
            <h3 className="text-lg font-serif italic font-bold text-[#121212]">Specify Roster Rejection Reason</h3>
            <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
              State reasons (e.g., duplicated jerseys, over-age players). This returns the roster to draft mode.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label htmlFor="roster-rejection-reason" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Rejection Reason
                </label>
                <textarea
                  id="roster-rejection-reason"
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Jersey #10 is assigned to multiple forwards. Please rectify before resubmitting roster."
                  className="w-full rounded-none border border-[#E5E5E1] p-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                <button
                  type="button"
                  onClick={() => setRejectingRosterId(null)}
                  className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-none bg-rose-600 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-700 cursor-pointer"
                  id="submit-roster-reject"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Player Modal */}
      {showAddPlayerModal && (() => {
        const activeTeam = teams.find((t) => t.id === showAddPlayerModal);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-none bg-white p-6 border border-[#E5E5E1] shadow-none">
              <h3 className="text-lg font-serif italic font-bold text-[#121212]">Add Athlete to {activeTeam?.name}</h3>
              <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
                Directly register a simulated student-athlete into the submission pool.
              </p>

              <form onSubmit={handleAddPlayer} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-p-first" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      First Name
                    </label>
                    <input
                      id="new-p-first"
                      type="text"
                      required
                      placeholder="e.g. Timothy"
                      value={newPlayerFirst}
                      onChange={(e) => setNewPlayerFirst(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-p-last" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Last Name
                    </label>
                    <input
                      id="new-p-last"
                      type="text"
                      required
                      placeholder="e.g. McVeigh"
                      value={newPlayerLast}
                      onChange={(e) => setNewPlayerLast(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-p-jersey" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Jersey Number
                    </label>
                    <input
                      id="new-p-jersey"
                      type="number"
                      min="1"
                      max="99"
                      required
                      value={newPlayerJersey}
                      onChange={(e) => setNewPlayerJersey(parseInt(e.target.value) || 10)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-p-pos" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Position
                    </label>
                    <select
                      id="new-p-pos"
                      value={newPlayerPos}
                      onChange={(e) => setNewPlayerPos(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden capitalize cursor-pointer"
                    >
                      <option value="forward">Forward</option>
                      <option value="midfielder">Midfielder</option>
                      <option value="defender">Defender</option>
                      <option value="goalkeeper">Goalkeeper</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-p-dob" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Birth Date
                    </label>
                    <input
                      id="new-p-dob"
                      type="date"
                      required
                      value={newPlayerDOB}
                      onChange={(e) => setNewPlayerDOB(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden bg-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-p-nat" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                      Nationality
                    </label>
                    <input
                      id="new-p-nat"
                      type="text"
                      placeholder="e.g. American"
                      value={newPlayerNat}
                      onChange={(e) => setNewPlayerNat(e.target.value)}
                      className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayerModal(null)}
                    className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="editorial-btn-accent text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    id="submit-sim-player-btn"
                  >
                    Register Athlete
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Mark Injured Dialog */}
      {injuryPlayerId && (() => {
        const injuredPlayer = players.find((p) => p.id === injuryPlayerId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-none bg-white p-6 border border-[#E5E5E1] shadow-none">
              <h3 className="text-lg font-serif italic font-bold text-[#121212] flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-[#D43D2A]" />
                Report Injury: {injuredPlayer?.firstName} {injuredPlayer?.lastName}
              </h3>
              <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
                Mark this player as injured. They will be unavailable for lineup submissions until cleared.
              </p>

              <form onSubmit={handleConfirmInjury} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="injury-desc" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Injury Description *
                  </label>
                  <input
                    id="injury-desc"
                    type="text"
                    required
                    placeholder="e.g. ACL tear, hamstring strain, concussion"
                    value={injuryDescription}
                    onChange={(e) => setInjuryDescription(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-3 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="injury-return" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Expected Return Date *
                  </label>
                  <input
                    id="injury-return"
                    type="date"
                    required
                    value={injuryReturnDate}
                    onChange={(e) => setInjuryReturnDate(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-3 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="injury-notes" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Medical Notes (optional)
                  </label>
                  <textarea
                    id="injury-notes"
                    rows={3}
                    placeholder="Treatment plan, rehab schedule, doctor recommendations..."
                    value={injuryMedicalNotes}
                    onChange={(e) => setInjuryMedicalNotes(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] p-3 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                  <button
                    type="button"
                    onClick={() => setInjuryPlayerId(null)}
                    className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-none bg-red-600 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
                  >
                    Confirm Injury
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
