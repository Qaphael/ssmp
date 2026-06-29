/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Settings, Server, Check, UserCircle } from 'lucide-react';
import { UserRole } from '@ssmp/shared-types';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
}

export default function Header({ currentRole, onChangeRole, apiUrl, onSaveApiUrl }: HeaderProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [savedMessage, setSavedMessage] = useState(false);

  const rolesList: { value: UserRole; label: string }[] = [
    { value: 'comp_admin', label: 'Competition Admin' },
    { value: 'system_admin', label: 'System Admin' },
    { value: 'registrar', label: 'Registrar' },
    { value: 'referee_coordinator', label: 'Referee Coordinator' },
    { value: 'official', label: 'Official' },
    { value: 'coach', label: 'Coach' },
  ];

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiUrl(tempUrl);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-[#E5E5E1] bg-[#FBFBF9] px-6 md:px-10">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-serif italic tracking-tight text-[#121212]">
          Competition <span className="text-[#8b8b85] font-normal">Management</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status or configuration */}
        <div className="relative">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 rounded-none border border-[#121212] bg-white px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-[#121212] transition hover:bg-[#121212] hover:text-white"
            id="api-config-toggle"
          >
            <Server className="h-3.5 w-3.5 text-[#121212] group-hover:text-white" />
            <span className="hidden sm:inline">
              {apiUrl ? 'API: Connected' : 'Mock REST Active'}
            </span>
            <span className="sm:hidden">API</span>
          </button>

          {showConfig && (
            <div className="absolute right-0 mt-2 w-80 rounded-none border border-[#E5E5E1] bg-white p-5 shadow-lg z-50">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#121212]">
                <Settings className="h-4 w-4 text-[#8b8b85]" />
                REST API Integration
              </h4>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-sans">
                Connect the administration panel to your live server. Leave empty to use local storage.
              </p>
              <form onSubmit={handleSaveUrl} className="mt-4">
                <div className="space-y-2">
                  <label htmlFor="api-url-input" className="block text-[9px] font-bold uppercase tracking-wider text-[#8b8b85]">
                    Target API URL
                  </label>
                  <input
                    id="api-url-input"
                    type="url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://api.competitionplatform.com/v1"
                    className="w-full rounded-none border border-[#E5E5E1] px-3 py-2 text-xs focus:border-[#121212] focus:outline-hidden"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  {savedMessage ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 font-sans">
                      <Check className="h-3 w-3" /> Config saved!
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8b8b85] hover:text-[#121212]"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="bg-[#121212] text-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D43D2A]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Role Simulator Selector */}
        <div className="flex items-center gap-2 border-l border-[#E5E5E1] pl-4">
          <Shield className="h-4 w-4 text-[#D43D2A]" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8b8b85]">
              Active Simulator
            </span>
            <select
              id="role-simulator-select"
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="mt-0.5 rounded-none border-none bg-transparent p-0 text-xs font-bold font-serif italic text-[#D43D2A] focus:ring-0 focus:outline-hidden cursor-pointer"
            >
              {rolesList.map((role) => (
                <option key={role.value} value={role.value} className="font-sans text-[#121212] not-italic">
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 border-l border-[#E5E5E1] pl-4">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-xs font-bold text-[#121212]">Sarah Jenkins</span>
            <span className="text-[9px] text-[#8b8b85] font-mono uppercase">League Commissioner</span>
          </div>
          <div className="w-8 h-8 rounded-none bg-[#121212] flex items-center justify-center text-white text-xs font-bold font-serif">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
}
