/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle,
  Award,
  Calendar,
  Layers,
  Settings,
  ArrowRight,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { Sport, Season, Competition, CompetitionRules } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface CompetitionWizardProps {
  seasons: Season[];
  onCompetitionCreated: (comp: Competition) => void;
}

const STEPS = [
  { name: 'General Details', icon: Trophy },
  { name: 'Schedule & Format', icon: Calendar },
  { name: 'Rules & Standings', icon: Settings },
  { name: 'Review & Launch', icon: Award },
];

export default function CompetitionWizard({ seasons, onCompetitionCreated }: CompetitionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('football');
  const [seasonId, setSeasonId] = useState(seasons[0]?.id || 'season-2026-fall');
  const [division, setDivision] = useState('Division A');
  const [opensAt, setOpensAt] = useState('2026-07-01');
  const [closesAt, setClosesAt] = useState('2026-08-31');
  const [enableGroups, setEnableGroups] = useState(false);
  const [enableKnockouts, setEnableKnockouts] = useState(true);

  // Points & Rules State
  const [pointsForWin, setPointsForWin] = useState(3);
  const [pointsForDraw, setPointsForDraw] = useState(1);
  const [pointsForLoss, setPointsForLoss] = useState(0);
  const [matchDuration, setMatchDuration] = useState(90);
  const [halfTimeDuration, setHalfTimeDuration] = useState(15);
  const [substitutions, setSubstitutions] = useState(5);
  const [yellowCardsLimit, setYellowCardsLimit] = useState(2);

  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [createdComp, setCreatedComp] = useState<Competition | null>(null);

  // Reset Form
  const resetForm = () => {
    setName('');
    setSport('football');
    setSeasonId(seasons[0]?.id || 'season-2026-fall');
    setDivision('Division A');
    setOpensAt('2026-07-01');
    setClosesAt('2026-08-31');
    setEnableGroups(false);
    setEnableKnockouts(true);
    setPointsForWin(3);
    setPointsForDraw(1);
    setPointsForLoss(0);
    setMatchDuration(90);
    setHalfTimeDuration(15);
    setSubstitutions(5);
    setYellowCardsLimit(2);
    setCurrentStep(0);
    setWizardSuccess(false);
    setCreatedComp(null);
  };

  const handleNext = () => {
    if (currentStep === 0 && !name.trim()) {
      alert('Please fill in the competition name.');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rules: CompetitionRules = {
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
      matchDurationMinutes: matchDuration,
      halfTimeDurationMinutes: halfTimeDuration,
      extraTimeDurationMinutes: 15,
      allowedSubstitutions: substitutions,
      yellowCardsForSuspension: yellowCardsLimit,
      suspensionMatches: 1,
      redCardImmediateSuspension: true,
      walkoverDefaultScoreHome: sport === 'basketball' ? 20 : 3,
      walkoverDefaultScoreAway: 0,
    };

    const apiUrl = mockDb.getApiUrl();
    if (!apiUrl) {
      alert('Please set the API URL in the header before creating a competition.');
      return;
    }

    const res = await fetch(`${apiUrl}/api/competitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seasonId,
        name,
        sport,
        division,
        rules,
        registrationWindow: {
          opensAt: new Date(opensAt).toISOString(),
          closesAt: new Date(closesAt).toISOString(),
        },
        enableGroups,
        enableKnockouts,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      alert(`Failed to create competition: ${err.error || res.statusText}`);
      return;
    }

    const newComp = await res.json();
    setCreatedComp(newComp);
    setWizardSuccess(true);
    onCompetitionCreated(newComp);
  };

  // Pre-configured rules helpers based on sport type
  const applySportPresets = (selectedSport: Sport) => {
    setSport(selectedSport);
    if (selectedSport === 'basketball') {
      setPointsForWin(2);
      setPointsForDraw(0);
      setPointsForLoss(1);
      setMatchDuration(40);
      setHalfTimeDuration(10);
      setSubstitutions(12);
    } else if (selectedSport === 'football') {
      setPointsForWin(3);
      setPointsForDraw(1);
      setPointsForLoss(0);
      setMatchDuration(90);
      setHalfTimeDuration(15);
      setSubstitutions(5);
    } else if (selectedSport === 'volleyball') {
      setPointsForWin(2);
      setPointsForDraw(0);
      setPointsForLoss(0);
      setMatchDuration(60);
      setHalfTimeDuration(5);
      setSubstitutions(6);
    } else {
      setPointsForWin(3);
      setPointsForDraw(1);
      setPointsForLoss(0);
      setMatchDuration(80);
      setHalfTimeDuration(10);
      setSubstitutions(5);
    }
  };

  if (wizardSuccess && createdComp) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center bg-red-50 text-[#D43D2A] border border-[#D43D2A] mb-6">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-serif italic font-bold text-[#121212]">Competition Launched</h2>
        <p className="mt-3 text-xs md:text-sm text-[#8b8b85] max-w-md mx-auto font-sans font-medium">
          The competition <strong className="text-[#121212]">"{createdComp.name}"</strong> has been successfully set up and added to the tournament schedule.
        </p>

        <div className="mt-8 rounded-none border border-[#E5E5E1] bg-white p-6 text-left">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8b8b85] border-b border-[#E5E5E1] pb-2 mb-4">Competition Brief</h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs font-sans">
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Sport</span>
              <p className="font-semibold text-[#121212] capitalize">{createdComp.sport}</p>
            </div>
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Division</span>
              <p className="font-semibold text-[#121212]">{createdComp.division || 'None'}</p>
            </div>
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Registration Opens</span>
              <p className="font-semibold text-[#121212] font-mono">
                {new Date(createdComp.registrationWindow.opensAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Registration Closes</span>
              <p className="font-semibold text-[#121212] font-mono">
                {new Date(createdComp.registrationWindow.closesAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Points Win / Draw / Loss</span>
              <p className="font-semibold text-[#121212] font-mono">
                {createdComp.rules.pointsForWin} / {createdComp.rules.pointsForDraw} / {createdComp.rules.pointsForLoss}
              </p>
            </div>
            <div>
              <span className="text-[#8b8b85] text-[10px] font-bold uppercase tracking-widest block mb-0.5">Structure</span>
              <p className="font-semibold text-[#121212]">
                {[
                  createdComp.enableGroups ? 'Group Stage' : null,
                  createdComp.enableKnockouts ? 'Knockouts' : null,
                ]
                  .filter(Boolean)
                  .join(' + ') || 'Single Standing'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={resetForm}
            className="editorial-btn-primary cursor-pointer"
          >
            Create Another Competition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-6 font-sans">
      <div className="mb-8 border-b border-[#E5E5E1] pb-6">
        <h1 className="text-2xl font-serif italic font-bold text-[#121212] tracking-tight flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#D43D2A]" />
          Competition Setup Wizard
        </h1>
        <p className="text-xs text-[#8b8b85] mt-1 font-medium font-sans">
          Establish league frameworks, points structures, and compliance rules for district sports matches.
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <React.Fragment key={step.name}>
                {idx > 0 && (
                  <div
                    className={`h-[1px] flex-1 transition-colors duration-200 mx-4 ${
                      isCompleted ? 'bg-[#121212]' : 'bg-[#E5E5E1]'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-none border transition-all duration-200 ${
                      isCompleted
                        ? 'border-[#121212] bg-[#121212] text-white'
                        : isCurrent
                        ? 'border-[#D43D2A] bg-white text-[#D43D2A] font-bold'
                        : 'border-[#E5E5E1] bg-white text-slate-400'
                    }`}
                  >
                    <StepIcon className="h-4.5 w-4.5" />
                  </div>
                  <span
                    className={`mt-2.5 text-[9px] font-bold uppercase tracking-widest ${
                      isCurrent ? 'text-[#D43D2A]' : 'text-[#8b8b85]'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Frame */}
      <form onSubmit={handleSubmit} className="rounded-none border border-[#E5E5E1] bg-white p-8 md:p-10 shadow-none">
        {/* Step 1: General Details */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-serif italic font-bold text-[#121212] mb-1">Competition Identity</h3>
              <p className="text-xs text-slate-400 font-medium">Provide name and category tags for the tournament structure.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="comp-name" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Competition Name
                </label>
                <input
                  id="comp-name"
                  type="text"
                  placeholder="e.g. Under-17 Boys District Football Championship"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="comp-season" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Target Season
                  </label>
                  <select
                    id="comp-season"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-3 py-3 text-xs bg-white focus:border-[#121212] focus:outline-hidden cursor-pointer"
                  >
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="comp-sport" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Sport Discipline
                  </label>
                  <select
                    id="comp-sport"
                    value={sport}
                    onChange={(e) => applySportPresets(e.target.value as Sport)}
                    className="w-full rounded-none border border-[#E5E5E1] px-3 py-3 text-xs bg-white focus:border-[#121212] focus:outline-hidden capitalize cursor-pointer"
                  >
                    <option value="football">Football ⚽</option>
                    <option value="basketball">Basketball 🏀</option>
                    <option value="volleyball">Volleyball 🏐</option>
                    <option value="athletics">Athletics 🏃</option>
                    <option value="swimming">Swimming 🏊</option>
                    <option value="other">Other Sport 🏅</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="comp-division" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                    Division / Tier
                  </label>
                  <input
                    id="comp-division"
                    type="text"
                    placeholder="e.g. Division A, Gold Tier"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#FBFBF9] p-4 border border-[#E5E5E1]">
              <span className="text-[9px] font-bold text-[#D43D2A] uppercase tracking-widest">Quick Presets applied</span>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Choosing a sport auto-configures normal duration limits, substitute roster standards, and standing points that you can fine-tune in step 3.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Format */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-serif italic font-bold text-[#121212] mb-1">Registration Timeline & Bracket format</h3>
              <p className="text-xs text-slate-400 font-medium">Control school team entry schedules and final bracket layout.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="registration-opens" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Registration Window Opens
                </label>
                <input
                  id="registration-opens"
                  type="date"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden bg-white cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="registration-closes" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Registration Window Closes
                </label>
                <input
                  id="registration-closes"
                  type="date"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden bg-white cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t border-[#E5E5E1] pt-6">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-4">
                Tournament Structure Layout
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 rounded-none border border-[#E5E5E1] bg-white p-5 hover:bg-[#FBFBF9] cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={enableGroups}
                    onChange={(e) => setEnableGroups(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-none border-[#E5E5E1] text-[#D43D2A] focus:ring-[#D43D2A]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#121212]">Enable Group Stage</span>
                    <span className="mt-1 text-[11px] text-slate-500 leading-normal font-medium font-sans">
                      Teams are split into separate seed pools/groups. Points calculate separately inside groups before elimination rounds.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-none border border-[#E5E5E1] bg-white p-5 hover:bg-[#FBFBF9] cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={enableKnockouts}
                    onChange={(e) => setEnableKnockouts(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-none border-[#E5E5E1] text-[#D43D2A] focus:ring-[#D43D2A]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#121212]">Enable Knockout Bracket (Playoffs)</span>
                    <span className="mt-1 text-[11px] text-slate-500 leading-normal font-medium font-sans">
                      Direct single-elimination tournament style matching (Quarterfinals, Semifinals, Finals) to decide final cup champion.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Rules & Standings */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-serif italic font-bold text-[#121212] mb-1">Standings Points & Match Limits</h3>
              <p className="text-xs text-slate-400 font-medium">Fine-tune competitive scoring metrics and roster sizing restrictions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="points-win" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Points for Win
                </label>
                <input
                  id="points-win"
                  type="number"
                  min="0"
                  max="10"
                  value={pointsForWin}
                  onChange={(e) => setPointsForWin(parseInt(e.target.value) || 0)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="points-draw" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Points for Draw
                </label>
                <input
                  id="points-draw"
                  type="number"
                  min="0"
                  max="10"
                  value={pointsForDraw}
                  onChange={(e) => setPointsForDraw(parseInt(e.target.value) || 0)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden disabled:bg-[#F1F1ED] disabled:text-[#8b8b85]"
                  disabled={sport === 'basketball' || sport === 'volleyball'}
                />
              </div>

              <div>
                <label htmlFor="points-loss" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Points for Loss
                </label>
                <input
                  id="points-loss"
                  type="number"
                  min="0"
                  max="10"
                  value={pointsForLoss}
                  onChange={(e) => setPointsForLoss(parseInt(e.target.value) || 0)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-[#E5E5E1] pt-6">
              <div>
                <label htmlFor="match-duration" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Match Duration (Minutes)
                </label>
                <input
                  id="match-duration"
                  type="number"
                  min="10"
                  max="120"
                  value={matchDuration}
                  onChange={(e) => setMatchDuration(parseInt(e.target.value) || 90)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="substitutions-limit" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Max Substitutions Allowed
                </label>
                <input
                  id="substitutions-limit"
                  type="number"
                  min="0"
                  max="12"
                  value={substitutions}
                  onChange={(e) => setSubstitutions(parseInt(e.target.value) || 5)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="yellow-cards-limit" className="block text-[9px] font-bold uppercase tracking-widest text-[#8b8b85] mb-2">
                  Yellow Cards for Suspension
                </label>
                <input
                  id="yellow-cards-limit"
                  type="number"
                  min="1"
                  max="10"
                  value={yellowCardsLimit}
                  onChange={(e) => setYellowCardsLimit(parseInt(e.target.value) || 2)}
                  className="w-full rounded-none border border-[#E5E5E1] px-4 py-3 text-xs focus:border-[#121212] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-serif italic font-bold text-[#121212] mb-1">Verify Competition Settings</h3>
              <p className="text-xs text-slate-400 font-medium">Ensure the layout parameters are correct before publishing standard rules.</p>
            </div>

            <div className="divide-y divide-[#E5E5E1] rounded-none border border-[#E5E5E1] bg-[#FBFBF9] px-6 py-4 font-sans">
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Competition Name</span>
                <span className="font-semibold text-[#121212]">{name}</span>
              </div>
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Sport & Division</span>
                <span className="font-semibold text-[#121212] capitalize">
                  {sport} ({division})
                </span>
              </div>
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Registration Window</span>
                <span className="font-semibold text-[#121212] font-mono">
                  {new Date(opensAt).toLocaleDateString()} to {new Date(closesAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Standings Win/Draw/Loss Points</span>
                <span className="font-semibold text-[#121212] font-mono">
                  {pointsForWin} / {pointsForDraw} / {pointsForLoss} Points
                </span>
              </div>
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Match Sizing Standards</span>
                <span className="font-semibold text-[#121212]">
                  {matchDuration} minutes match • Max {substitutions} subs • Yellow cards: {yellowCardsLimit}
                </span>
              </div>
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#8b8b85] font-bold uppercase text-[10px] tracking-wider">Structural Format</span>
                <span className="font-semibold text-[#121212]">
                  {[
                    enableGroups ? 'Group Pool' : null,
                    enableKnockouts ? 'Knockout Stage' : null,
                  ]
                    .filter(Boolean)
                    .join(' & ') || 'Single Table League'}
                </span>
              </div>
            </div>

            <div className="rounded-none border border-red-100 bg-red-50 p-4">
              <p className="text-[11px] text-[#D43D2A] leading-normal font-medium font-sans">
                ⚠️ Launching a competition will publish the rules and immediately open registrations for eligible district schools according to the timeline. Double check all points calculations.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Actions Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-[#E5E5E1] pt-6">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center gap-2 border border-[#121212] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#121212] hover:bg-[#121212] hover:text-white transition rounded-none cursor-pointer ${
              currentStep === 0 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="editorial-btn-accent flex items-center gap-2 cursor-pointer"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="editorial-btn-primary flex items-center gap-2 cursor-pointer"
            >
              Confirm & Launch Competition
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
