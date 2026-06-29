/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Building2,
  Users,
  Calendar,
  AlertTriangle,
  Flame,
  ArrowRightLeft,
  Award,
  Megaphone,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRegCount: number;
  pendingRosterCount: number;
  fixtureClashCount: number;
  pendingTransferCount: number;
  pendingMediaCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingRegCount,
  pendingRosterCount,
  fixtureClashCount,
  pendingTransferCount,
  pendingMediaCount,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'wizard',
      label: 'Setup Wizard',
      icon: Trophy,
      badge: null,
    },
    {
      id: 'registrations',
      label: 'Registrations Queue',
      icon: Building2,
      badge: pendingRegCount > 0 ? pendingRegCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'rosters',
      label: 'Rosters Queue',
      icon: Users,
      badge: pendingRosterCount > 0 ? pendingRosterCount : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'fixtures',
      label: 'Fixtures & Clashes',
      icon: Calendar,
      badge: fixtureClashCount > 0 ? fixtureClashCount : null,
      badgeColor: 'bg-[#D43D2A] text-white animate-pulse',
    },
    {
      id: 'transfers',
      label: 'Transfers & Discipline',
      icon: ArrowRightLeft,
      badge: pendingTransferCount > 0 ? pendingTransferCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'officials',
      label: 'Officials & Live Events',
      icon: Award,
      badge: null,
    },
    {
      id: 'news',
      label: 'News & Media',
      icon: Megaphone,
      badge: pendingMediaCount > 0 ? pendingMediaCount : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-[#E5E5E1] bg-[#FBFBF9] text-[#121212] flex flex-col shrink-0">
      {/* Platform Title */}
      <div className="flex flex-col border-b border-[#E5E5E1] px-6 py-6">
        <h2 className="text-2xl font-serif italic font-bold tracking-tight text-[#D43D2A] flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#D43D2A]" />
          Athletica.
        </h2>
        <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">
          Admin Control Panel
        </p>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <p className="px-3 text-[9px] uppercase tracking-widest text-[#8b8b85] font-bold mb-2">Management</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center justify-between px-3 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-150 ${
                isActive
                  ? 'bg-[#121212] text-white border-l-4 border-[#D43D2A]'
                  : 'text-[#8b8b85] hover:text-[#121212] hover:bg-[#F1F1ED]'
              }`}
              id={`sidebar-link-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#D43D2A]' : 'text-[#8b8b85]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono font-bold leading-none ${
                  item.badgeColor || 'bg-[#121212] text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Info panel */}
      <div className="p-4 m-4 bg-white border border-[#E5E5E1] text-[#121212]">
        <div className="flex gap-2.5 items-start">
          <AlertTriangle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${fixtureClashCount > 0 ? 'text-[#D43D2A]' : 'text-slate-400'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#121212] uppercase tracking-widest">Conflict Log</span>
            <p className="mt-1 text-[11px] text-[#8b8b85] leading-normal font-mono">
              {fixtureClashCount > 0
                ? `WARNING: ${fixtureClashCount} overlapping slot conflicts detected.`
                : 'STATUS: OK. Perfect schedule detected.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[#E5E5E1] p-4 text-center bg-[#F1F1ED]">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
          v2.4.0 • District Division
        </span>
      </div>
    </aside>
  );
}
