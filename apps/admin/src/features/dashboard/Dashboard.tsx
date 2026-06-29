import React from 'react';
import {
  Competition,
  Team,
  Player,
  TeamRegistration,
  RosterSubmission,
  Fixture,
  Official,
  Suspension,
  MatchEvent,
  Notification,
  UserRole,
} from '@ssmp/shared-types';
import CompAdminDashboard from './CompAdminDashboard';
import CoachDashboard from './CoachDashboard';
import OfficialDashboard from './OfficialDashboard';

interface DashboardProps {
  currentRole: UserRole;
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  registrations: TeamRegistration[];
  rosters: RosterSubmission[];
  fixtures: Fixture[];
  officials: Official[];
  suspensions: Suspension[];
  matchEvents: MatchEvent[];
  notifications: Notification[];
  clashCount: number;
  onNavigate: (tab: string) => void;
}

export default function Dashboard(props: DashboardProps) {
  switch (props.currentRole) {
    case 'coach':
      return (
        <CoachDashboard
          teams={props.teams}
          players={props.players}
          fixtures={props.fixtures}
          suspensions={props.suspensions}
          notifications={props.notifications}
          onNavigate={props.onNavigate}
        />
      );

    case 'official':
      return (
        <OfficialDashboard
          fixtures={props.fixtures}
          teams={props.teams}
          officials={props.officials}
          onNavigate={props.onNavigate}
        />
      );

    case 'comp_admin':
    case 'system_admin':
    case 'registrar':
    case 'referee_coordinator':
    default:
      return (
        <CompAdminDashboard
          competitions={props.competitions}
          teams={props.teams}
          players={props.players}
          registrations={props.registrations}
          rosters={props.rosters}
          fixtures={props.fixtures}
          officials={props.officials}
          clashCount={props.clashCount}
          onNavigate={props.onNavigate}
        />
      );
  }
}
