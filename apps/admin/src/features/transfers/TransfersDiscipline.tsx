/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  School,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { TransferRequest, Suspension, Player, Team, Competition } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface TransfersDisciplineProps {
  transfers: TransferRequest[];
  suspensions: Suspension[];
  players: Player[];
  teams: Team[];
  competitions: Competition[];
  onActionCompleted: () => void;
}

async function apiFetch(path: string, options?: RequestInit) {
  const url = mockDb.getApiUrl();
  if (!url) return null;
  const token = await mockDb.getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options?.headers as Record<string, string>) || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${url}${path}`, { ...options, headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ?? data;
}

export default function TransfersDiscipline({
  transfers: propTransfers,
  suspensions: propSuspensions,
  players,
  teams,
  competitions,
  onActionCompleted,
}: TransfersDisciplineProps) {
  const [activeSubTab, setActiveSubTab] = useState<'transfers' | 'discipline'>('transfers');
  const [localTransfers, setLocalTransfers] = useState<TransferRequest[]>(propTransfers);
  const [localSuspensions, setLocalSuspensions] = useState<Suspension[]>(propSuspensions);

  useEffect(() => { setLocalTransfers(propTransfers); }, [propTransfers]);
  useEffect(() => { setLocalSuspensions(propSuspensions); }, [propSuspensions]);

  // Transfer state
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({});

  // Suspension state
  const [newSuspPlayerId, setNewSuspPlayerId] = useState('');
  const [newSuspCompId, setNewSuspCompId] = useState('');
  const [newSuspReason, setNewSuspReason] = useState('');
  const [newSuspCount, setNewSuspCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getPlayerName = (pid: string) => {
    const p = players.find((pl) => pl.id === pid);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Athlete';
  };

  const getTeamName = (tid: string) => {
    const t = teams.find((tm) => tm.id === tid);
    return t ? t.name : 'Unknown Team';
  };

  const getCompName = (cid: string) => {
    const c = competitions.find((co) => co.id === cid);
    return c ? c.name : 'Unknown Championship';
  };

  // Handlers
  const handleApproveTransfer = async (id: string) => {
    await apiFetch(`/api/transfers/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    });
    setLocalTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: 'approved' as const } : t));
    onActionCompleted();
  };

  const handleRejectTransfer = async (id: string) => {
    const reason = rejectionReasons[id] || 'Does not meet eligibility criteria.';
    await apiFetch(`/api/transfers/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
    });
    setLocalTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: 'rejected' as const, rejectionReason: reason } : t));
    onActionCompleted();
    setShowRejectForm((prev) => ({ ...prev, [id]: false }));
  };

  const handleCreateSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuspPlayerId || !newSuspCompId || !newSuspReason) {
      setErrorMsg('Please populate all suspension parameters.');
      return;
    }

    const result = await apiFetch('/api/discipline/suspensions', {
      method: 'POST',
      body: JSON.stringify({
        playerId: newSuspPlayerId,
        competitionId: newSuspCompId,
        reason: newSuspReason,
        matchesCount: Number(newSuspCount),
      }),
    });

    if (result) {
      setLocalSuspensions((prev) => [result, ...prev]);
    }

    setNewSuspPlayerId('');
    setNewSuspReason('');
    setNewSuspCount(1);
    setErrorMsg('');
    setSuccessMsg('Disciplinary suspension logged successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
    onActionCompleted();
  };

  const handleDeleteSuspension = async (id: string) => {
    await apiFetch(`/api/discipline/suspensions/${id}`, { method: 'DELETE' });
    setLocalSuspensions((prev) => prev.filter((s) => s.id !== id));
    onActionCompleted();
  };

  const pendingTransfers = localTransfers.filter((t) => t.status === 'pending');
  const pastTransfers = localTransfers.filter((t) => t.status !== 'pending');

  return (
    <div className="space-y-6 font-sans">
      {/* Editorial Title */}
      <div className="border-b border-[#121212] pb-4">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#121212]">
          Compliance, <span className="text-[#D43D2A]">Transfers</span> & Discipline
        </h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 font-bold leading-normal">
          Upholding athlete eligibility criteria and district code-of-conduct guidelines.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#E5E5E1]">
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'transfers'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" /> Transfer Portal
            {pendingTransfers.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#D43D2A] text-white font-bold rounded-none">
                {pendingTransfers.length} NEW
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('discipline')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'discipline'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Suspensions Registry
            {localSuspensions.filter((s) => !s.isServed).length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#121212] text-white font-bold rounded-none">
                {localSuspensions.filter((s) => !s.isServed).length} ACTIVE
              </span>
            )}
          </span>
        </button>
      </div>

      {activeSubTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main queue */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">
                Active Transfer Requests Queue
              </h2>

              {pendingTransfers.length === 0 ? (
                <div className="border border-dashed border-[#E5E5E1] p-12 text-center bg-white">
                  <ArrowRightLeft className="h-10 w-10 text-slate-300 mx-auto stroke-1" />
                  <p className="mt-4 text-sm font-serif italic text-slate-500">
                    No student-athlete transfers are pending review.
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    The portal is fully synchronized.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingTransfers.map((req) => (
                    <div
                      key={req.id}
                      className="border border-[#121212] bg-white p-6 relative rounded-none hover:shadow-sm transition-all"
                    >
                      <div className="absolute top-0 left-0 h-1.5 w-full bg-[#D43D2A]" />
                      <div className="flex flex-wrap items-start justify-between gap-4 mt-1">
                        <div>
                          <span className="text-[10px] font-mono uppercase bg-red-50 text-[#D43D2A] border border-red-100 px-2 py-0.5 font-bold">
                            PENDING COMPLIANCE CHECK
                          </span>
                          <h3 className="mt-3 text-lg font-serif font-bold text-[#121212]">
                            {getPlayerName(req.playerId)}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-mono uppercase mt-1">
                            {getCompName(req.competitionId)}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Path info */}
                      <div className="my-5 flex items-center gap-4 bg-[#FBFBF9] border border-[#E5E5E1] p-4 text-xs font-semibold">
                        <div className="flex-1">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">RELEASE TEAM</p>
                          <p className="text-[#121212]">{getTeamName(req.fromTeamId)}</p>
                        </div>
                        <ArrowRightLeft className="h-5 w-5 text-[#D43D2A] shrink-0" />
                        <div className="flex-1 text-right">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">ACQUIRING TEAM</p>
                          <p className="text-[#D43D2A] font-bold">{getTeamName(req.toTeamId)}</p>
                        </div>
                      </div>

                      <div className="space-y-1 bg-amber-50/50 border border-amber-100 p-3.5 mb-6">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-amber-800 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> TRANSFER JUSTIFICATION
                        </span>
                        <p className="text-xs text-amber-900 leading-relaxed font-sans italic">
                          "{req.reason}"
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E5E1] pt-5">
                        <button
                          onClick={() => handleApproveTransfer(req.id)}
                          className="px-4 py-2 bg-[#121212] hover:bg-[#D43D2A] text-white text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                        >
                          Approve Eligibility & Transfer
                        </button>

                        <div className="flex items-center gap-2">
                          {!showRejectForm[req.id] ? (
                            <button
                              onClick={() => setShowRejectForm((prev) => ({ ...prev, [req.id]: true }))}
                              className="px-4 py-2 border border-slate-300 text-slate-500 hover:text-black hover:border-black text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                            >
                              Deny Request
                            </button>
                          ) : (
                            <div className="flex gap-2 w-full max-w-md">
                              <input
                                type="text"
                                placeholder="Enter rejection reason..."
                                value={rejectionReasons[req.id] || ''}
                                onChange={(e) =>
                                  setRejectionReasons((prev) => ({ ...prev, [req.id]: e.target.value }))
                                }
                                className="border border-[#121212] px-3 py-1.5 text-xs focus:ring-0 focus:outline-none w-56 font-sans bg-white"
                              />
                              <button
                                onClick={() => handleRejectTransfer(req.id)}
                                className="px-3 py-1.5 bg-[#D43D2A] text-white text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:bg-red-700"
                              >
                                Submit Deny
                              </button>
                              <button
                                onClick={() => setShowRejectForm((prev) => ({ ...prev, [req.id]: false }))}
                                className="px-2 py-1.5 text-xs text-slate-400 hover:text-black cursor-pointer font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past transfers log */}
            <div className="pt-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">
                Transfer Audit History
              </h3>
              <div className="border border-[#E5E5E1] bg-white overflow-hidden rounded-none">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#F1F1ED] border-b border-[#E5E5E1] text-[10px] uppercase font-bold tracking-wider text-slate-600 font-mono">
                      <th className="py-3 px-4">Student Athlete</th>
                      <th className="py-3 px-4">From</th>
                      <th className="py-3 px-4">To</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E1] text-xs">
                    {pastTransfers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic font-serif">
                          No historical logs on record.
                        </td>
                      </tr>
                    ) : (
                      pastTransfers.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-55/30 transition">
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#121212]">{getPlayerName(req.playerId)}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase">{getCompName(req.competitionId)}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{getTeamName(req.fromTeamId)}</td>
                          <td className="py-3 px-4 text-slate-500 font-medium">{getTeamName(req.toTeamId)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                              req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}>
                              {req.status === 'approved' ? (
                                <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <XCircle className="h-2.5 w-2.5 text-red-600" />
                              )}
                              {req.status}
                            </span>
                            {req.rejectionReason && (
                              <p className="text-[10px] text-red-700 italic mt-1 max-w-xs">{req.rejectionReason}</p>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="border border-[#121212] bg-[#FBFBF9] p-6 rounded-none">
              <h3 className="text-xs uppercase tracking-wider text-[#121212] font-bold flex items-center gap-2 border-b border-[#121212] pb-3">
                <AlertOctagon className="h-4.5 w-4.5 text-[#D43D2A]" /> Compliance Checklist
              </h3>
              <ul className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">01.</span>
                  <span>Verify student age limits for Division categories.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">02.</span>
                  <span>Confirm transfer window deadlines. Once closed, only emergency exceptions are permitted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[#D43D2A] font-bold">03.</span>
                  <span>Approving a transfer automatically shifts the player's affiliation profile, allowing they are rostered in the new team.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'discipline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of active suspensions */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">
                Active Player Suspensions
              </h2>

              <div className="border border-[#E5E5E1] bg-white rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#F1F1ED] border-b border-[#E5E5E1] text-[10px] uppercase font-bold tracking-wider text-slate-600 font-mono">
                      <th className="py-3 px-4">Student Athlete</th>
                      <th className="py-3 px-4">Championship / Category</th>
                      <th className="py-3 px-4">Reason for Suspension</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E1] text-xs">
                    {localSuspensions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 italic font-serif bg-white">
                          No active athletic suspensions logged. Perfect compliance standard!
                        </td>
                      </tr>
                    ) : (
                      localSuspensions.map((s) => {
                        const p = players.find((pl) => pl.id === s.playerId);
                        const t = p ? teams.find((tm) => tm.id === p.teamId) : null;
                        return (
                          <tr key={s.id} className="hover:bg-slate-55/30 transition">
                            <td className="py-4 px-4 font-bold text-[#121212]">
                              <p>{getPlayerName(s.playerId)}</p>
                              {t && <p className="text-[10px] font-mono text-slate-400 font-normal">{t.name}</p>}
                            </td>
                            <td className="py-4 px-4 text-slate-500">{getCompName(s.competitionId)}</td>
                            <td className="py-4 px-4 text-slate-500 max-w-xs">{s.reason}</td>
                            <td className="py-4 px-4 font-mono font-bold text-[#D43D2A]">
                              {s.matchesCount - s.matchesServed} matches remaining
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => handleDeleteSuspension(s.id)}
                                className="text-[10px] uppercase tracking-wider font-bold text-[#D43D2A] hover:underline cursor-pointer"
                                title="Revoke Suspension"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* New Suspension Form */}
          <div>
            <div className="border border-[#121212] bg-white p-6 rounded-none">
              <h3 className="text-xs uppercase tracking-wider text-[#121212] font-bold border-b border-[#121212] pb-3 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-[#D43D2A]" /> Issue Athlete Suspension
              </h3>

              <form onSubmit={handleCreateSuspension} className="mt-4 space-y-4 font-sans text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-[#D43D2A] border border-red-100 font-semibold font-sans">
                    ⚠️ {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold font-sans">
                    ✓ {successMsg}
                  </div>
                )}

                <div>
                  <label className="block uppercase tracking-wider font-bold text-slate-400 mb-1.5 font-mono text-[9px]">
                    Select Student Athlete
                  </label>
                  <select
                    value={newSuspPlayerId}
                    onChange={(e) => {
                      setNewSuspPlayerId(e.target.value);
                      // Auto populate competition if the player team exists
                      const player = players.find((pl) => pl.id === e.target.value);
                      const team = player ? teams.find((tm) => tm.id === player.teamId) : null;
                      if (team) {
                        setNewSuspCompId(team.competitionId);
                      }
                    }}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none font-sans"
                    required
                  >
                    <option value="">-- Choose Athlete --</option>
                    {players.map((p) => {
                      const t = teams.find((tm) => tm.id === p.teamId);
                      const c = t ? competitions.find((co) => co.id === t.competitionId) : null;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} ({t ? t.name : 'No Team'}) {c ? `• ${c.division || 'A'}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-bold text-slate-400 mb-1.5 font-mono text-[9px]">
                    Championship Division
                  </label>
                  <select
                    value={newSuspCompId}
                    onChange={(e) => setNewSuspCompId(e.target.value)}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none font-sans"
                    required
                  >
                    <option value="">-- Choose Competition --</option>
                    {competitions.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-bold text-slate-400 mb-1.5 font-mono text-[9px]">
                    Duration (Match Bans)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newSuspCount}
                    onChange={(e) => setNewSuspCount(Number(e.target.value))}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-bold text-slate-400 mb-1.5 font-mono text-[9px]">
                    Disciplinary Infraction Reason
                  </label>
                  <textarea
                    placeholder="e.g. Received two cautionable offences on Matchday 1..."
                    rows={3}
                    value={newSuspReason}
                    onChange={(e) => setNewSuspReason(e.target.value)}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none font-sans resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#121212] text-white uppercase tracking-wider font-bold font-mono text-[10px] hover:bg-[#D43D2A] transition-all cursor-pointer text-center"
                >
                  Log Suspension
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
