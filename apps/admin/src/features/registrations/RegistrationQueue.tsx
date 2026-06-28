/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Check,
  X,
  Search,
  Filter,
  User,
  Mail,
  Trophy,
  Plus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TeamRegistration, Competition } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface RegistrationQueueProps {
  registrations: TeamRegistration[];
  competitions: Competition[];
  onReviewCompleted: () => void;
}

export default function RegistrationQueue({
  registrations,
  competitions,
  onReviewCompleted,
}: RegistrationQueueProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');

  // Rejection modal states
  const [rejectingRegId, setRejectingRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Quick seed states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simSchool, setSimSchool] = useState('');
  const [simTeam, setSimTeam] = useState('');
  const [simCoachName, setSimCoachName] = useState('');
  const [simCoachEmail, setSimCoachEmail] = useState('');
  const [simCompId, setSimCompId] = useState(competitions[0]?.id || 'comp-u17-football');

  // Filters calculation
  const filteredRegs = registrations.filter((reg) => {
    const matchesSearch =
      reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.coachFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.coachLastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesComp = selectedComp === 'all' || reg.competitionId === selectedComp;
    const matchesStatus = selectedStatus === 'all' || reg.status === selectedStatus;

    return matchesSearch && matchesComp && matchesStatus;
  });

  const handleApprove = (id: string) => {
    mockDb.reviewRegistration(id, 'approved');
    onReviewCompleted();
  };

  const handleStartReject = (id: string) => {
    setRejectingRegId(id);
    setRejectionReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    if (rejectingRegId) {
      mockDb.reviewRegistration(rejectingRegId, 'rejected', rejectionReason);
      setRejectingRegId(null);
      onReviewCompleted();
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simSchool.trim() || !simTeam.trim() || !simCoachName.trim() || !simCoachEmail.trim()) {
      alert('Please complete all simulation fields.');
      return;
    }

    const regs = mockDb.getRegistrations();
    const splitName = simCoachName.trim().split(' ');
    const fName = splitName[0] || 'Coach';
    const lName = splitName.slice(1).join(' ') || 'User';

    const newReg: TeamRegistration = {
      id: `reg-${Math.random().toString(36).substring(2, 9)}`,
      competitionId: simCompId,
      teamName: simTeam.trim(),
      schoolName: simSchool.trim(),
      coachEmail: simCoachEmail.trim(),
      coachFirstName: fName,
      coachLastName: lName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    regs.push(newReg);
    localStorage.setItem('sm_registrations', JSON.stringify(regs));

    // Also register the Team with pending state
    const teams = mockDb.getTeams();
    teams.push({
      id: `team-${Math.random().toString(36).substring(2, 9)}`,
      competitionId: simCompId,
      name: simTeam.trim(),
      schoolName: simSchool.trim(),
      registrationStatus: 'pending',
      rosterApprovalStatus: 'draft',
      coachId: `coach-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem('sm_teams', JSON.stringify(teams));

    // Reset simulator
    setSimSchool('');
    setSimTeam('');
    setSimCoachName('');
    setSimCoachEmail('');
    setShowSimulateModal(false);
    onReviewCompleted();
  };

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E5E1] pb-6">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#D43D2A]" />
            Registration Approval Queue
          </h1>
          <p className="text-xs text-[#8b8b85] mt-1 font-medium font-sans">
            Verify district eligibility of teams, validate administrative contacts, and approve entries.
          </p>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="editorial-btn-accent flex items-center gap-1.5 self-start cursor-pointer font-sans"
          id="simulate-registration-btn"
        >
          <Plus className="h-3.5 w-3.5" /> Simulate New Registration
        </button>
      </div>

      {/* Filter Toolbar */}
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
          <Filter className="h-3.5 w-3.5 text-[#8b8b85]" />
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
          <HelpCircle className="h-3.5 w-3.5 text-[#8b8b85]" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
          >
            <option value="pending">Status: Pending Only ({pendingCount})</option>
            <option value="approved">Status: Approved</option>
            <option value="rejected">Status: Rejected</option>
            <option value="all">Status: All Submissions</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b8b85] font-sans">
            Showing {filteredRegs.length} request(s)
          </span>
        </div>
      </div>

      {/* Queue Stream */}
      {filteredRegs.length === 0 ? (
        <div className="rounded-none border border-dashed border-[#E5E5E1] bg-white py-12 text-center">
          <Building2 className="mx-auto h-8 w-8 text-[#8b8b85]" />
          <h3 className="mt-4 text-sm font-serif italic font-bold text-[#121212]">No Registrations Found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, selecting a different status category, or simulating a new entry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegs.map((reg) => {
            const comp = competitions.find((c) => c.id === reg.competitionId);

            return (
              <div
                key={reg.id}
                className={`relative flex flex-col justify-between gap-4 rounded-none border p-6 transition-all md:flex-row md:items-center ${
                  reg.status === 'pending'
                    ? 'border-[#E5E5E1] border-l-4 border-l-[#D43D2A] bg-[#FBFBF9]/30'
                    : reg.status === 'approved'
                    ? 'border-[#E5E5E1] border-l-4 border-l-[#121212] bg-white'
                    : 'border-[#E5E5E1] bg-[#FBFBF9]/50'
                }`}
                id={`registration-card-${reg.id}`}
              >
                <div className="space-y-3">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-none bg-white border border-[#E5E5E1] px-2 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                      <Trophy className="h-3 w-3 text-[#D43D2A]" /> {comp?.name || 'District Cup'}
                    </span>

                    {reg.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 rounded-none bg-[#D43D2A]/10 border border-[#D43D2A]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#D43D2A] uppercase tracking-wider">
                        Pending Approval
                      </span>
                    )}
                    {reg.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-none bg-[#121212]/10 border border-[#121212]/20 px-2.5 py-0.5 text-[9px] font-bold text-[#121212] uppercase tracking-wider">
                        Approved & Provisioned
                      </span>
                    )}
                    {reg.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 rounded-none bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-bold text-rose-800 uppercase tracking-wider">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* School / Team Title */}
                  <div>
                    <h3 className="text-base font-serif italic font-bold text-[#121212]">
                      {reg.teamName}
                    </h3>
                    <span className="text-xs text-[#8b8b85] font-medium font-sans">
                      School: <strong className="text-[#121212] font-semibold">{reg.schoolName}</strong>
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="flex flex-col gap-x-6 gap-y-1.5 text-xs text-[#8b8b85] sm:flex-row">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Coach: {reg.coachFirstName} {reg.coachLastName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {reg.coachEmail}
                    </span>
                  </div>

                  {/* Rejection Feedback */}
                  {reg.status === 'rejected' && reg.rejectionReason && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-none bg-rose-50 p-3 border border-rose-100">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-rose-700">
                        <strong className="font-bold uppercase tracking-wider text-[9px]">Rejection Reason:</strong> {reg.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Queue Actions */}
                {reg.status === 'pending' && (
                  <div className="flex items-center gap-3 border-t border-[#E5E5E1] pt-4 md:border-t-0 md:pt-0 shrink-0">
                    <button
                      onClick={() => handleStartReject(reg.id)}
                      className="flex h-9 items-center gap-1.5 border border-rose-200 bg-white px-3 text-[10px] uppercase tracking-widest font-bold text-rose-600 transition hover:bg-rose-50 rounded-none cursor-pointer"
                      id={`reject-reg-btn-${reg.id}`}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="editorial-btn-primary flex h-9 items-center gap-1.5 px-4 cursor-pointer"
                      id={`approve-reg-btn-${reg.id}`}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve & Provision
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingRegId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-none bg-white p-6 border border-[#E5E5E1] shadow-none">
            <h3 className="text-lg font-serif italic font-bold text-[#121212]">Specify Rejection Reason</h3>
            <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
              Provide actionable feedback. The submitting coach will be notified of required adjustments.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label htmlFor="rejection-reason-input" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Rejection Reason
                </label>
                <textarea
                  id="rejection-reason-input"
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. The school athletic program does not have an active district insurance waiver uploaded. Please upload and re-register."
                  className="w-full rounded-none border border-[#E5E5E1] p-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                <button
                  type="button"
                  onClick={() => setRejectingRegId(null)}
                  className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-none bg-rose-600 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-rose-700 cursor-pointer"
                  id="confirm-reject-reg-btn"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulation Team Entry Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-none bg-white p-6 border border-[#E5E5E1] shadow-none">
            <h3 className="text-lg font-serif italic font-bold text-[#121212]">Simulate Entry Application</h3>
            <p className="mt-1 text-xs text-[#8b8b85] font-medium leading-relaxed">
              Inject a simulated registration record to test approval queues, workflow states, and automated team provisioning.
            </p>

            <form onSubmit={handleSimulateSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="sim-comp" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Target Competition
                </label>
                <select
                  id="sim-comp"
                  value={simCompId}
                  onChange={(e) => setSimCompId(e.target.value)}
                  className="w-full rounded-none border border-[#E5E5E1] p-2.5 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                >
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sim-school" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    School Name
                  </label>
                  <input
                    id="sim-school"
                    type="text"
                    required
                    placeholder="e.g. Oakridge Academy"
                    value={simSchool}
                    onChange={(e) => setSimSchool(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="sim-team" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Team Name Label
                  </label>
                  <input
                    id="sim-team"
                    type="text"
                    required
                    placeholder="e.g. Oakridge Centurions"
                    value={simTeam}
                    onChange={(e) => setSimTeam(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sim-coach" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Coach Full Name
                  </label>
                  <input
                    id="sim-coach"
                    type="text"
                    required
                    placeholder="e.g. Raymond Holt"
                    value={simCoachName}
                    onChange={(e) => setSimCoachName(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="sim-email" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Coach Email
                  </label>
                  <input
                    id="sim-email"
                    type="email"
                    required
                    placeholder="r.holt@oakridge.edu"
                    value={simCoachEmail}
                    onChange={(e) => setSimCoachEmail(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-2.5 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5E5E1] pt-4">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="rounded-none border border-[#E5E5E1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] hover:bg-[#FBFBF9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="editorial-btn-accent text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                  id="submit-sim-registration"
                >
                  Inject Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
