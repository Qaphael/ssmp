/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Server, UserCircle } from 'lucide-react';
import { UserRole } from '@ssmp/shared-types';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
}

export default function Header({ currentRole, onChangeRole, apiUrl }: HeaderProps) {
  const rolesList: { value: UserRole; label: string }[] = [
    { value: 'comp_admin', label: 'Competition Admin' },
    { value: 'system_admin', label: 'System Admin' },
    { value: 'registrar', label: 'Registrar' },
    { value: 'referee_coordinator', label: 'Referee Coordinator' },
    { value: 'official', label: 'Official' },
    { value: 'coach', label: 'Coach' },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-[#E5E5E1] bg-[#FBFBF9] px-6 md:px-10">
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-serif italic tracking-tight text-[#121212]">
          Competition <span className="text-[#8b8b85] font-normal">Management</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E1] bg-white">
          <Server className="h-3.5 w-3.5" />
          <span className={`text-[10px] uppercase font-bold tracking-widest ${apiUrl ? 'text-emerald-700' : 'text-amber-700'}`}>
            {apiUrl ? 'Live API' : 'Demo Mode'}
          </span>
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
