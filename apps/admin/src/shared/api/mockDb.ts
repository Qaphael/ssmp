/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Organization,
  Season,
  Competition,
  Team,
  Player,
  TeamRegistration,
  RosterSubmission,
  Fixture,
  Pitch,
  Sport,
  Official,
  TransferRequest,
  MatchEvent,
  Lineup,
  Card,
  Suspension,
  Media,
  NewsArticle,
  Standing,
} from '@ssmp/shared-types';

// Storage keys
const ORG_KEY = 'sm_org';
const SEASONS_KEY = 'sm_seasons';
const COMPS_KEY = 'sm_comps';
const PITCHES_KEY = 'sm_pitches';
const TEAMS_KEY = 'sm_teams';
const PLAYERS_KEY = 'sm_players';
const REGISTRATIONS_KEY = 'sm_registrations';
const ROSTERS_KEY = 'sm_rosters';
const FIXTURES_KEY = 'sm_fixtures';
const API_URL_KEY = 'sm_api_url';
const OFFICIALS_KEY = 'sm_officials';
const TRANSFERS_KEY = 'sm_transfers';
const EVENTS_KEY = 'sm_events';
const LINEUPS_KEY = 'sm_lineups';
const CARDS_KEY = 'sm_cards';
const SUSPENSIONS_KEY = 'sm_suspensions';
const MEDIA_KEY = 'sm_media';
const NEWS_KEY = 'sm_news';
const STANDINGS_KEY = 'sm_standings';

// Helper to generate UUIDs if needed
function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

// Initial seed data
const initialOrg: Organization = {
  id: 'org-1',
  name: 'Metro Schools Sports Association',
  description: 'Primary governing body for district inter-school athletic championships.',
  logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=150',
  contactEmail: 'admin@metroschoolssports.org',
  contactPhone: '+1 (555) 123-4567',
  address: '452 Stadium Way, Metropolis',
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-01-15T08:00:00Z',
};

const initialSeasons: Season[] = [
  {
    id: 'season-2026-fall',
    organizationId: 'org-1',
    name: 'Fall Championship 2026',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    isArchived: false,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'season-2026-spring',
    organizationId: 'org-1',
    name: 'Spring Cup 2026',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    isArchived: true,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-10-01T09:00:00Z',
  },
];

const initialPitches: Pitch[] = [
  {
    id: 'pitch-stadium',
    organizationId: 'org-1',
    name: 'Main Field (Stadium)',
    address: 'Arena Complex Gate A',
    capacity: 5000,
    surfaceType: 'Natural Grass',
    isAvailable: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'pitch-east',
    organizationId: 'org-1',
    name: 'East Pitch (Practice Field)',
    address: 'Arena Complex Gate C',
    capacity: 500,
    surfaceType: 'Artificial Turf',
    isAvailable: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'pitch-north',
    organizationId: 'org-1',
    name: 'North Turf',
    address: 'Arena Complex Gate B',
    capacity: 300,
    surfaceType: 'Artificial Turf',
    isAvailable: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'pitch-indoor-1',
    organizationId: 'org-1',
    name: 'Gymnasium Court A',
    address: 'Metropolis Indoor Arena Floor 1',
    capacity: 1200,
    surfaceType: 'Hardwood Maple',
    isAvailable: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
];

const initialCompetitions: Competition[] = [
  {
    id: 'comp-u17-football',
    seasonId: 'season-2026-fall',
    name: 'District Under-17 Boys Football Championship',
    sport: 'football',
    division: 'Division A',
    status: 'registration_open',
    rules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      matchDurationMinutes: 90,
      halfTimeDurationMinutes: 15,
      extraTimeDurationMinutes: 15,
      allowedSubstitutions: 5,
      yellowCardsForSuspension: 2,
      suspensionMatches: 1,
      redCardImmediateSuspension: true,
      walkoverDefaultScoreHome: 3,
      walkoverDefaultScoreAway: 0,
    },
    registrationWindow: {
      opensAt: '2026-06-01T00:00:00Z',
      closesAt: '2026-08-25T23:59:59Z',
    },
    enableGroups: false,
    enableKnockouts: true,
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 'comp-varsity-basket',
    seasonId: 'season-2026-fall',
    name: 'Varsity Girls Basketball League',
    sport: 'basketball',
    division: 'Gold Tier',
    status: 'setup',
    rules: {
      pointsForWin: 2,
      pointsForDraw: 0,
      pointsForLoss: 1, // Traditional basketball standing points (usually 2 for win, 1 for loss)
      matchDurationMinutes: 40,
      halfTimeDurationMinutes: 10,
      extraTimeDurationMinutes: 5,
      allowedSubstitutions: 12,
      yellowCardsForSuspension: 5,
      suspensionMatches: 1,
      redCardImmediateSuspension: true,
      walkoverDefaultScoreHome: 20,
      walkoverDefaultScoreAway: 0,
    },
    registrationWindow: {
      opensAt: '2026-07-01T00:00:00Z',
      closesAt: '2026-09-01T23:59:59Z',
    },
    enableGroups: true,
    enableKnockouts: true,
    createdAt: '2026-06-12T14:30:00Z',
    updatedAt: '2026-06-12T14:30:00Z',
  },
];

const initialTeams: Team[] = [
  {
    id: 'team-westside-tigers',
    competitionId: 'comp-u17-football',
    name: 'Westside Tigers',
    schoolName: 'Westside High School',
    description: 'Defending champions of the Metropolis District League.',
    logoUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=120',
    primaryColor: '#EA580C', // Orange
    secondaryColor: '#1E293B', // Dark grey
    registrationStatus: 'approved',
    rosterApprovalStatus: 'submitted', // Ready for roster review!
    coachId: 'coach-1',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 'team-eastcoast-falcons',
    competitionId: 'comp-u17-football',
    name: 'East Coast Falcons',
    schoolName: 'East Coast Secondary School',
    description: 'Runner-up in the regional summer tournament.',
    logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120',
    primaryColor: '#1D4ED8', // Blue
    secondaryColor: '#F8FAFC', // White
    registrationStatus: 'approved',
    rosterApprovalStatus: 'approved', // Roster is approved
    coachId: 'coach-2',
    createdAt: '2026-06-16T10:15:00Z',
    updatedAt: '2026-06-16T10:15:00Z',
  },
  {
    id: 'team-northstar-academy',
    competitionId: 'comp-u17-football',
    name: 'North Star United',
    schoolName: 'North Star Academy',
    description: 'A dynamic squad focused on modern tactical football.',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120',
    primaryColor: '#059669', // Emerald green
    secondaryColor: '#FBBF24', // Yellow
    registrationStatus: 'approved',
    rosterApprovalStatus: 'draft',
    coachId: 'coach-3',
    createdAt: '2026-06-18T11:30:00Z',
    updatedAt: '2026-06-18T11:30:00Z',
  },
  {
    id: 'team-valley-raiders',
    competitionId: 'comp-u17-football',
    name: 'Valley Raiders',
    schoolName: 'Valley View Comprehensive',
    description: 'Excited to represent the Valley district in the cup.',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120',
    primaryColor: '#DC2626', // Red
    secondaryColor: '#111827', // Black
    registrationStatus: 'pending', // Pending registration approval!
    rosterApprovalStatus: 'draft',
    coachId: 'coach-4',
    createdAt: '2026-06-25T14:20:00Z',
    updatedAt: '2026-06-25T14:20:00Z',
  },
  {
    id: 'team-summit-knights',
    competitionId: 'comp-u17-football',
    name: 'Summit Knights',
    schoolName: 'Summit Academy High',
    description: 'First time entrants with high expectations.',
    logoUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=120',
    primaryColor: '#7C3AED', // Purple
    secondaryColor: '#F59E0B', // Amber
    registrationStatus: 'pending', // Pending registration approval!
    rosterApprovalStatus: 'draft',
    coachId: 'coach-5',
    createdAt: '2026-06-27T16:45:00Z',
    updatedAt: '2026-06-27T16:45:00Z',
  },
];

const initialPlayers: Player[] = [
  // Westside Tigers Roster (Submitted)
  {
    id: 'p-wt-1',
    teamId: 'team-westside-tigers',
    firstName: 'Marcus',
    lastName: 'Rashford',
    jerseyNumber: 10,
    position: 'forward',
    dateOfBirth: '2010-10-31',
    nationality: 'British',
    height: 180,
    weight: 70,
    status: 'active',
    createdAt: '2026-06-15T09:30:00Z',
    updatedAt: '2026-06-15T09:30:00Z',
  },
  {
    id: 'p-wt-2',
    teamId: 'team-westside-tigers',
    firstName: 'Jordan',
    lastName: 'Pickford',
    jerseyNumber: 1,
    position: 'goalkeeper',
    dateOfBirth: '2009-03-07',
    nationality: 'English',
    height: 185,
    weight: 78,
    status: 'active',
    createdAt: '2026-06-15T09:35:00Z',
    updatedAt: '2026-06-15T09:35:00Z',
  },
  {
    id: 'p-wt-3',
    teamId: 'team-westside-tigers',
    firstName: 'Declan',
    lastName: 'Rice',
    jerseyNumber: 6,
    position: 'midfielder',
    dateOfBirth: '2009-01-14',
    nationality: 'Irish',
    height: 183,
    weight: 75,
    status: 'active',
    createdAt: '2026-06-15T09:40:00Z',
    updatedAt: '2026-06-15T09:40:00Z',
  },
  {
    id: 'p-wt-4',
    teamId: 'team-westside-tigers',
    firstName: 'Harry',
    lastName: 'Maguire',
    jerseyNumber: 5,
    position: 'defender',
    dateOfBirth: '2009-03-05',
    nationality: 'English',
    height: 194,
    weight: 85,
    status: 'active',
    createdAt: '2026-06-15T09:45:00Z',
    updatedAt: '2026-06-15T09:45:00Z',
  },
  {
    id: 'p-wt-5',
    teamId: 'team-westside-tigers',
    firstName: 'Bukayo',
    lastName: 'Saka',
    jerseyNumber: 7,
    position: 'forward',
    dateOfBirth: '2010-09-05',
    nationality: 'Nigerian',
    height: 178,
    weight: 68,
    status: 'active',
    createdAt: '2026-06-15T09:50:00Z',
    updatedAt: '2026-06-15T09:50:00Z',
  },

  // East Coast Falcons Roster (Approved)
  {
    id: 'p-ef-1',
    teamId: 'team-eastcoast-falcons',
    firstName: 'Christian',
    lastName: 'Pulisic',
    jerseyNumber: 10,
    position: 'midfielder',
    dateOfBirth: '2009-09-18',
    nationality: 'American',
    height: 177,
    weight: 69,
    status: 'active',
    createdAt: '2026-06-16T10:30:00Z',
    updatedAt: '2026-06-16T10:30:00Z',
  },
  {
    id: 'p-ef-2',
    teamId: 'team-eastcoast-falcons',
    firstName: 'Matt',
    lastName: 'Turner',
    jerseyNumber: 1,
    position: 'goalkeeper',
    dateOfBirth: '2009-06-24',
    nationality: 'American',
    height: 190,
    weight: 80,
    status: 'active',
    createdAt: '2026-06-16T10:35:00Z',
    updatedAt: '2026-06-16T10:35:00Z',
  },
  {
    id: 'p-ef-3',
    teamId: 'team-eastcoast-falcons',
    firstName: 'Weston',
    lastName: 'McKennie',
    jerseyNumber: 8,
    position: 'midfielder',
    dateOfBirth: '2009-08-28',
    nationality: 'American',
    height: 183,
    weight: 79,
    status: 'active',
    createdAt: '2026-06-16T10:40:00Z',
    updatedAt: '2026-06-16T10:40:00Z',
  },
  {
    id: 'p-ef-4',
    teamId: 'team-eastcoast-falcons',
    firstName: 'Timothy',
    lastName: 'Weah',
    jerseyNumber: 11,
    position: 'forward',
    dateOfBirth: '2010-02-22',
    nationality: 'Liberian',
    height: 182,
    weight: 72,
    status: 'active',
    createdAt: '2026-06-16T10:45:00Z',
    updatedAt: '2026-06-16T10:45:00Z',
  },
];

const initialRegistrations: TeamRegistration[] = [
  {
    id: 'reg-valley-raiders',
    competitionId: 'comp-u17-football',
    teamName: 'Valley Raiders',
    schoolName: 'Valley View Comprehensive',
    coachEmail: 'coach.val@valleyview.edu',
    coachFirstName: 'Valerie',
    coachLastName: 'Jenkins',
    status: 'pending',
    createdAt: '2026-06-25T14:20:00Z',
    updatedAt: '2026-06-25T14:20:00Z',
  },
  {
    id: 'reg-summit-knights',
    competitionId: 'comp-u17-football',
    teamName: 'Summit Knights',
    schoolName: 'Summit Academy High',
    coachEmail: 'k.gregory@summitacademy.org',
    coachFirstName: 'Keith',
    coachLastName: 'Gregory',
    status: 'pending',
    createdAt: '2026-06-27T16:45:00Z',
    updatedAt: '2026-06-27T16:45:00Z',
  },
  {
    id: 'reg-westside-tigers',
    competitionId: 'comp-u17-football',
    teamName: 'Westside Tigers',
    schoolName: 'Westside High School',
    coachEmail: 'coach.t@westsidehigh.edu',
    coachFirstName: 'Thomas',
    coachLastName: 'Miller',
    status: 'approved',
    reviewedBy: 'comp-admin-1',
    reviewedAt: '2026-06-16T09:00:00Z',
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-16T09:00:00Z',
  },
  {
    id: 'reg-eastcoast-falcons',
    competitionId: 'comp-u17-football',
    teamName: 'East Coast Falcons',
    schoolName: 'East Coast Secondary School',
    coachEmail: 'falcons@eastcoastsecondary.edu',
    coachFirstName: 'Arthur',
    coachLastName: 'Pendleton',
    status: 'approved',
    reviewedBy: 'comp-admin-1',
    reviewedAt: '2026-06-17T11:00:00Z',
    createdAt: '2026-06-16T10:15:00Z',
    updatedAt: '2026-06-17T11:00:00Z',
  },
];

const initialRosters: RosterSubmission[] = [
  {
    id: 'roster-westside-tigers',
    teamId: 'team-westside-tigers',
    competitionId: 'comp-u17-football',
    playerIds: ['p-wt-1', 'p-wt-2', 'p-wt-3', 'p-wt-4', 'p-wt-5'],
    status: 'submitted',
    submittedBy: 'coach-1',
    createdAt: '2026-06-26T10:00:00Z',
    updatedAt: '2026-06-26T10:00:00Z',
  },
  {
    id: 'roster-eastcoast-falcons',
    teamId: 'team-eastcoast-falcons',
    competitionId: 'comp-u17-football',
    playerIds: ['p-ef-1', 'p-ef-2', 'p-ef-3', 'p-ef-4'],
    status: 'approved',
    submittedBy: 'coach-2',
    reviewedBy: 'comp-admin-1',
    reviewedAt: '2026-06-27T12:00:00Z',
    createdAt: '2026-06-26T11:15:00Z',
    updatedAt: '2026-06-27T12:00:00Z',
  },
];

const initialFixtures: Fixture[] = [
  {
    id: 'fix-1',
    competitionId: 'comp-u17-football',
    matchday: 1,
    homeTeamId: 'team-westside-tigers',
    awayTeamId: 'team-eastcoast-falcons',
    scheduledAt: '2026-09-10T14:00:00.000Z', // 2 PM
    pitchId: 'pitch-stadium',
    status: 'scheduled',
    createdAt: '2026-06-28T04:00:00Z',
    updatedAt: '2026-06-28T04:00:00Z',
  },
  {
    id: 'fix-2',
    competitionId: 'comp-u17-football',
    matchday: 1,
    homeTeamId: 'team-northstar-academy',
    awayTeamId: 'team-westside-tigers',
    scheduledAt: '2026-09-10T14:30:00.000Z', // 2:30 PM (Overlap clash on Pitch Stadium since football matches are 90 min!)
    pitchId: 'pitch-stadium',
    status: 'scheduled',
    createdAt: '2026-06-28T04:05:00Z',
    updatedAt: '2026-06-28T04:05:00Z',
  },
  {
    id: 'fix-3',
    competitionId: 'comp-u17-football',
    matchday: 1,
    homeTeamId: 'team-eastcoast-falcons',
    awayTeamId: 'team-northstar-academy',
    scheduledAt: '2026-09-10T14:00:00.000Z', // 2 PM (Another clash on same Pitch Stadium!)
    pitchId: 'pitch-stadium',
    status: 'scheduled',
    createdAt: '2026-06-28T04:10:00Z',
    updatedAt: '2026-06-28T04:10:00Z',
  },
  {
    id: 'fix-4',
    competitionId: 'comp-u17-football',
    matchday: 2,
    homeTeamId: 'team-westside-tigers',
    awayTeamId: 'team-northstar-academy',
    scheduledAt: '2026-09-17T15:00:00.000Z',
    pitchId: 'pitch-east', // Clean on Pitch East
    status: 'scheduled',
    createdAt: '2026-06-28T04:15:00Z',
    updatedAt: '2026-06-28T04:15:00Z',
  },
  {
    id: 'fix-5',
    competitionId: 'comp-u17-football',
    matchday: 2,
    homeTeamId: 'team-eastcoast-falcons',
    awayTeamId: 'team-valley-raiders',
    scheduledAt: '2026-09-17T15:00:00.000Z',
    pitchId: 'pitch-stadium', // Clean since pitch is stadium and East is used by Tigers
    status: 'scheduled',
    createdAt: '2026-06-28T04:20:00Z',
    updatedAt: '2026-06-28T04:20:00Z',
  },
];

const initialOfficials: Official[] = [
  {
    id: 'off-1',
    userId: 'user-off-1',
    name: 'Pierluigi Collina',
    email: 'collina@metroschoolssports.org',
    phone: '+1 (555) 019-2831',
    certifications: ['FIFA Elite Badge', 'District Head Referee'],
    availability: { weekdayEvenings: true, weekends: true, holidays: false },
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'off-2',
    userId: 'user-off-2',
    name: 'Howard Webb',
    email: 'h.webb@metroschoolssports.org',
    phone: '+1 (555) 041-9492',
    certifications: ['Pro-Referee License', 'VAR Certified'],
    availability: { weekdayEvenings: false, weekends: true, holidays: true },
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'off-3',
    userId: 'user-off-3',
    name: 'Stephanie Frappart',
    email: 's.frappart@metroschoolssports.org',
    phone: '+1 (555) 088-3410',
    certifications: ['FIFA International Referee'],
    availability: { weekdayEvenings: true, weekends: true, holidays: true },
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
  },
];

const initialTransfers: TransferRequest[] = [
  {
    id: 'tr-1',
    playerId: 'p-wt-1',
    fromTeamId: 'team-westside-tigers',
    toTeamId: 'team-eastcoast-falcons',
    competitionId: 'comp-u17-football',
    reason: 'Academic transfer: Student relocating to East Coast residential district.',
    status: 'pending',
    requestedBy: 'coach-1',
    createdAt: '2026-06-27T09:00:00Z',
    updatedAt: '2026-06-27T09:00:00Z',
  },
  {
    id: 'tr-2',
    playerId: 'p-ef-4',
    fromTeamId: 'team-eastcoast-falcons',
    toTeamId: 'team-westside-tigers',
    competitionId: 'comp-u17-football',
    reason: 'Shorter daily commute to the Westside academy facility.',
    status: 'approved',
    requestedBy: 'coach-2',
    reviewedBy: 'comp-admin-1',
    reviewedAt: '2026-06-27T15:00:00Z',
    createdAt: '2026-06-26T14:30:00Z',
    updatedAt: '2026-06-27T15:00:00Z',
  },
];

const initialEvents: MatchEvent[] = [];
const initialLineups: Lineup[] = [];
const initialCards: Card[] = [];

const initialSuspensions: Suspension[] = [
  {
    id: 'susp-1',
    playerId: 'p-wt-2',
    competitionId: 'comp-u17-football',
    reason: 'Offensive language to match official (Red card incident in friendly match).',
    matchesCount: 1,
    matchesServed: 0,
    isServed: false,
    startDate: '2026-06-20',
    createdAt: '2026-06-20T17:00:00Z',
    updatedAt: '2026-06-20T17:00:00Z',
  },
];

const initialMedia: Media[] = [
  {
    id: 'med-1',
    uploadedBy: 'coach-1',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
    filename: 'squad_tigers.jpg',
    fileSize: 1045200,
    mimeType: 'image/jpeg',
    caption: 'Westside Tigers official squad briefing on Field Arena.',
    isApproved: false,
    createdAt: '2026-06-25T11:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
  },
  {
    id: 'med-2',
    uploadedBy: 'coach-2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
    filename: 'east_turf_check.jpg',
    fileSize: 985000,
    mimeType: 'image/jpeg',
    caption: 'East Pitch Turf bounce height verification session.',
    isApproved: true,
    approvedBy: 'comp-admin-1',
    createdAt: '2026-06-24T14:20:00Z',
    updatedAt: '2026-06-24T14:20:00Z',
  },
];

const initialNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Inaugural District Championship Kickoff Slated for September',
    content: 'The Metro Schools Sports Association (MSSA) has officially locked in the scheduled dates for the upcoming Under-17 Boys Football season. The opening matchday will feature a highly anticipated match between defending title-holders Westside Tigers and East Coast Falcons at the Main Field Stadium on September 10th.\n\nAll rosters must be locked 48 hours prior to kickoff. Good luck to all coaches and school-athletes!',
    excerpt: 'Under-17 Boys football season kickoff scheduled. Defending champions lock horns on matchday 1.',
    authorId: 'admin-1',
    isPublished: true,
    publishedAt: '2026-06-25T10:00:00Z',
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'news-2',
    title: 'Pitch Stadium Installs FIFA-grade Drainage Ahead of Rain Forecast',
    content: 'Metro District Arena groundskeeping teams completed an extensive overhaul of the main pitch. Brand new drainage allows the pitch to handle over 40mm of precipitation per hour, avoiding schedule postponements.',
    excerpt: 'Main field drainage overhaul finished successfully ahead of the autumn schedule.',
    authorId: 'admin-1',
    isPublished: false,
    createdAt: '2026-06-27T16:00:00Z',
    updatedAt: '2026-06-27T16:00:00Z',
  },
];

const initialStandings: Standing[] = [];

// Helper to retrieve data with fallback to initial seeds
function getStored<T>(key: string, seed: T): T {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing key ${key}, resetting to seed`, e);
    }
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Check if a fixture has timing and pitch conflicts
export interface ConflictWarning {
  fixtureId: string;
  type: 'pitch_clash' | 'team_double_booking';
  message: string;
  conflictingFixtureIds: string[];
}

export function detectConflicts(fixtures: Fixture[], competitions: Competition[]): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  for (let i = 0; i < fixtures.length; i++) {
    const f1 = fixtures[i];
    if (f1.status === 'cancelled') continue;

    const comp1 = competitions.find((c) => c.id === f1.competitionId);
    const duration1 = comp1?.rules?.matchDurationMinutes || 90;

    const start1 = new Date(f1.scheduledAt).getTime();
    const end1 = start1 + (duration1 + 15) * 60 * 1000; // adding 15 min buffer between matches

    const f1Conflicts: Set<string> = new Set();
    let f1DoubleBooking = false;

    for (let j = 0; j < fixtures.length; j++) {
      if (i === j) continue;
      const f2 = fixtures[j];
      if (f2.status === 'cancelled') continue;

      const comp2 = competitions.find((c) => c.id === f2.competitionId);
      const duration2 = comp2?.rules?.matchDurationMinutes || 90;

      const start2 = new Date(f2.scheduledAt).getTime();
      const end2 = start2 + (duration2 + 15) * 60 * 1000;

      // Overlap condition: start1 < end2 && start2 < end1
      const overlaps = start1 < end2 && start2 < end1;

      if (overlaps) {
        // 1. Same pitch clash
        if (f1.pitchId && f2.pitchId && f1.pitchId === f2.pitchId) {
          f1Conflicts.add(f2.id);
        }

        // 2. Team double booking clash (homeTeam or awayTeam playing in both matches)
        const teamsOverlap =
          f1.homeTeamId === f2.homeTeamId ||
          f1.homeTeamId === f2.awayTeamId ||
          f1.awayTeamId === f2.homeTeamId ||
          f1.awayTeamId === f2.awayTeamId;

        if (teamsOverlap) {
          warnings.push({
            fixtureId: f1.id,
            type: 'team_double_booking',
            message: `Team booking overlap with another match scheduled around the same time.`,
            conflictingFixtureIds: [f2.id],
          });
        }
      }
    }

    if (f1Conflicts.size > 0) {
      warnings.push({
        fixtureId: f1.id,
        type: 'pitch_clash',
        message: `Pitch conflict! Multiple matches are scheduled at this venue with overlapping times.`,
        conflictingFixtureIds: Array.from(f1Conflicts),
      });
    }
  }

  return warnings;
}

// Database Engine
export const mockDb = {
  getOrganization(): Organization {
    return getStored(ORG_KEY, initialOrg);
  },

  getSeasons(): Season[] {
    return getStored(SEASONS_KEY, initialSeasons);
  },

  getCompetitions(): Competition[] {
    return getStored(COMPS_KEY, initialCompetitions);
  },

  getPitches(): Pitch[] {
    return getStored(PITCHES_KEY, initialPitches);
  },

  getTeams(): Team[] {
    return getStored(TEAMS_KEY, initialTeams);
  },

  getPlayers(): Player[] {
    return getStored(PLAYERS_KEY, initialPlayers);
  },

  getRegistrations(): TeamRegistration[] {
    return getStored(REGISTRATIONS_KEY, initialRegistrations);
  },

  getRosters(): RosterSubmission[] {
    return getStored(ROSTERS_KEY, initialRosters);
  },

  getFixtures(): Fixture[] {
    return getStored(FIXTURES_KEY, initialFixtures);
  },

  getApiUrl(): string {
    return localStorage.getItem(API_URL_KEY) || '';
  },

  setApiUrl(url: string): void {
    localStorage.setItem(API_URL_KEY, url);
  },

  // Mutators
  saveCompetition(comp: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Competition {
    const comps = this.getCompetitions();
    const now = new Date().toISOString();

    if (comp.id) {
      // Edit
      const index = comps.findIndex((c) => c.id === comp.id);
      if (index !== -1) {
        const updated: Competition = {
          ...comps[index],
          ...comp,
          updatedAt: now,
        } as Competition;
        comps[index] = updated;
        setStored(COMPS_KEY, comps);
        return updated;
      }
    }

    // Create
    const newComp: Competition = {
      ...comp,
      id: generateId('comp'),
      status: comp.status || 'setup',
      createdAt: now,
      updatedAt: now,
    } as Competition;

    comps.push(newComp);
    setStored(COMPS_KEY, comps);
    return newComp;
  },

  // Approve / Reject Team Registration
  reviewRegistration(regId: string, status: 'approved' | 'rejected', reason?: string): void {
    const regs = this.getRegistrations();
    const teams = this.getTeams();
    const regIndex = regs.findIndex((r) => r.id === regId);

    if (regIndex !== -1) {
      regs[regIndex].status = status;
      regs[regIndex].rejectionReason = reason;
      regs[regIndex].reviewedAt = new Date().toISOString();
      regs[regIndex].reviewedBy = 'comp-admin-current';
      setStored(REGISTRATIONS_KEY, regs);

      // Reflect in Team
      const team = teams.find(
        (t) => t.competitionId === regs[regIndex].competitionId && t.name === regs[regIndex].teamName
      );
      if (team) {
        team.registrationStatus = status;
        setStored(TEAMS_KEY, teams);
      } else if (status === 'approved') {
        // If team does not exist and is approved, auto-provision it
        const newTeam: Team = {
          id: generateId('team'),
          competitionId: regs[regIndex].competitionId,
          name: regs[regIndex].teamName,
          schoolName: regs[regIndex].schoolName,
          registrationStatus: 'approved',
          rosterApprovalStatus: 'draft',
          coachId: generateId('coach'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        teams.push(newTeam);
        setStored(TEAMS_KEY, teams);
      }
    }
  },

  // Approve / Reject Roster Submission
  reviewRoster(submissionId: string, status: 'approved' | 'rejected', reason?: string): void {
    const rosters = this.getRosters();
    const teams = this.getTeams();
    const rosIndex = rosters.findIndex((r) => r.id === submissionId);

    if (rosIndex !== -1) {
      rosters[rosIndex].status = status;
      rosters[rosIndex].rejectionReason = reason;
      rosters[rosIndex].reviewedAt = new Date().toISOString();
      rosters[rosIndex].reviewedBy = 'comp-admin-current';
      setStored(ROSTERS_KEY, rosters);

      // Update Team roster approval status
      const teamIndex = teams.findIndex((t) => t.id === rosters[rosIndex].teamId);
      if (teamIndex !== -1) {
        teams[teamIndex].rosterApprovalStatus = status;
        setStored(TEAMS_KEY, teams);
      }
    }
  },

  // Save Fixture (add or edit)
  saveFixture(fixture: Omit<Fixture, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Fixture {
    const fixtures = this.getFixtures();
    const now = new Date().toISOString();

    if (fixture.id) {
      const idx = fixtures.findIndex((f) => f.id === fixture.id);
      if (idx !== -1) {
        const updated = {
          ...fixtures[idx],
          ...fixture,
          updatedAt: now,
        } as Fixture;
        fixtures[idx] = updated;
        setStored(FIXTURES_KEY, fixtures);
        return updated;
      }
    }

    const newFixture = {
      ...fixture,
      id: generateId('fix'),
      status: fixture.status || 'scheduled',
      createdAt: now,
      updatedAt: now,
    } as Fixture;

    fixtures.push(newFixture);
    setStored(FIXTURES_KEY, fixtures);
    return newFixture;
  },

  deleteFixture(id: string): void {
    const fixtures = this.getFixtures();
    const filtered = fixtures.filter((f) => f.id !== id);
    setStored(FIXTURES_KEY, filtered);
  },

  // Add sample team & players dynamically if needed for simulation
  addSamplePlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Player {
    const players = this.getPlayers();
    const newPlayer: Player = {
      ...player,
      id: generateId('p'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    players.push(newPlayer);
    setStored(PLAYERS_KEY, players);
    return newPlayer;
  },

  // Officials
  getOfficials(): Official[] {
    return getStored(OFFICIALS_KEY, initialOfficials);
  },

  saveOfficial(off: Omit<Official, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Official {
    const officials = this.getOfficials();
    const now = new Date().toISOString();

    if (off.id) {
      const idx = officials.findIndex((o) => o.id === off.id);
      if (idx !== -1) {
        const updated = { ...officials[idx], ...off, updatedAt: now } as Official;
        officials[idx] = updated;
        setStored(OFFICIALS_KEY, officials);
        return updated;
      }
    }

    const newOff = {
      ...off,
      id: generateId('off'),
      createdAt: now,
      updatedAt: now,
    } as Official;
    officials.push(newOff);
    setStored(OFFICIALS_KEY, officials);
    return newOff;
  },

  deleteOfficial(id: string): void {
    const officials = this.getOfficials();
    const filtered = officials.filter((o) => o.id !== id);
    setStored(OFFICIALS_KEY, filtered);
  },

  // Transfers
  getTransfers(): TransferRequest[] {
    return getStored(TRANSFERS_KEY, initialTransfers);
  },

  createTransfer(req: Omit<TransferRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): TransferRequest {
    const transfers = this.getTransfers();
    const now = new Date().toISOString();
    const newTr = {
      ...req,
      id: generateId('tr'),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    } as TransferRequest;

    transfers.push(newTr);
    setStored(TRANSFERS_KEY, transfers);
    return newTr;
  },

  reviewTransfer(trId: string, status: 'approved' | 'rejected', reason?: string): void {
    const transfers = this.getTransfers();
    const players = this.getPlayers();
    const idx = transfers.findIndex((t) => t.id === trId);

    if (idx !== -1) {
      const trans = transfers[idx];
      trans.status = status;
      trans.rejectionReason = reason;
      trans.reviewedAt = new Date().toISOString();
      trans.reviewedBy = 'comp-admin-current';
      setStored(TRANSFERS_KEY, transfers);

      // If approved, complete the player transfer (update teamId)
      if (status === 'approved') {
        const pIdx = players.findIndex((p) => p.id === trans.playerId);
        if (pIdx !== -1) {
          players[pIdx].teamId = trans.toTeamId;
          setStored(PLAYERS_KEY, players);
        }
      }
    }
  },

  // Match Events
  getEvents(): MatchEvent[] {
    return getStored(EVENTS_KEY, initialEvents);
  },

  addEvent(event: Omit<MatchEvent, 'id' | 'createdAt'>): MatchEvent {
    const events = this.getEvents();
    const newEvent = {
      ...event,
      id: generateId('evt'),
      createdAt: new Date().toISOString(),
    } as MatchEvent;

    events.push(newEvent);
    setStored(EVENTS_KEY, events);
    return newEvent;
  },

  clearEventsForMatch(matchId: string): void {
    const events = this.getEvents();
    const filtered = events.filter((e) => e.matchId !== matchId);
    setStored(EVENTS_KEY, filtered);
  },

  // Lineups
  getLineups(): Lineup[] {
    return getStored(LINEUPS_KEY, initialLineups);
  },

  saveLineup(lineup: Omit<Lineup, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Lineup {
    const lineups = this.getLineups();
    const now = new Date().toISOString();

    if (lineup.id) {
      const idx = lineups.findIndex((l) => l.id === lineup.id);
      if (idx !== -1) {
        const updated = { ...lineups[idx], ...lineup, updatedAt: now } as Lineup;
        lineups[idx] = updated;
        setStored(LINEUPS_KEY, lineups);
        return updated;
      }
    }

    const newL = {
      ...lineup,
      id: generateId('lin'),
      createdAt: now,
      updatedAt: now,
    } as Lineup;
    lineups.push(newL);
    setStored(LINEUPS_KEY, lineups);
    return newL;
  },

  // Suspensions
  getSuspensions(): Suspension[] {
    return getStored(SUSPENSIONS_KEY, initialSuspensions);
  },

  saveSuspension(susp: Omit<Suspension, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Suspension {
    const suspensions = this.getSuspensions();
    const now = new Date().toISOString();

    if (susp.id) {
      const idx = suspensions.findIndex((s) => s.id === susp.id);
      if (idx !== -1) {
        const updated = { ...suspensions[idx], ...susp, updatedAt: now } as Suspension;
        suspensions[idx] = updated;
        setStored(SUSPENSIONS_KEY, suspensions);
        return updated;
      }
    }

    const newSusp = {
      ...susp,
      id: generateId('susp'),
      createdAt: now,
      updatedAt: now,
    } as Suspension;
    suspensions.push(newSusp);
    setStored(SUSPENSIONS_KEY, suspensions);
    return newSusp;
  },

  deleteSuspension(id: string): void {
    const suspensions = this.getSuspensions();
    const filtered = suspensions.filter((s) => s.id !== id);
    setStored(SUSPENSIONS_KEY, filtered);
  },

  // Media
  getMedia(): Media[] {
    return getStored(MEDIA_KEY, initialMedia);
  },

  reviewMedia(medId: string, isApproved: boolean): void {
    const media = this.getMedia();
    const idx = media.findIndex((m) => m.id === medId);

    if (idx !== -1) {
      if (isApproved) {
        media[idx].isApproved = true;
        media[idx].approvedBy = 'comp-admin-current';
        setStored(MEDIA_KEY, media);
      } else {
        // Delete rejected media
        const filtered = media.filter((m) => m.id !== medId);
        setStored(MEDIA_KEY, filtered);
      }
    }
  },

  // News Articles
  getNews(): NewsArticle[] {
    return getStored(NEWS_KEY, initialNews);
  },

  saveNews(article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): NewsArticle {
    const news = this.getNews();
    const now = new Date().toISOString();

    if (article.id) {
      const idx = news.findIndex((n) => n.id === article.id);
      if (idx !== -1) {
        const updated = { ...news[idx], ...article, updatedAt: now } as NewsArticle;
        news[idx] = updated;
        setStored(NEWS_KEY, news);
        return updated;
      }
    }

    const newArt = {
      ...article,
      id: generateId('news'),
      createdAt: now,
      updatedAt: now,
    } as NewsArticle;
    news.push(newArt);
    setStored(NEWS_KEY, news);
    return newArt;
  },

  deleteNews(id: string): void {
    const news = this.getNews();
    const filtered = news.filter((n) => n.id !== id);
    setStored(NEWS_KEY, filtered);
  },

  // Calculate dynamic league standings on the fly
  calculateStandings(competitionId: string): Standing[] {
    const competitions = this.getCompetitions();
    const comp = competitions.find((c) => c.id === competitionId);
    if (!comp) return [];

    const teams = this.getTeams().filter((t) => t.competitionId === competitionId && t.registrationStatus === 'approved');
    const fixtures = this.getFixtures().filter((f) => f.competitionId === competitionId);

    const rules = comp.rules || {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      walkoverDefaultScoreHome: 3,
      walkoverDefaultScoreAway: 0,
    };

    // Initialize map
    const standingsMap: Record<string, Standing> = {};
    teams.forEach((t) => {
      standingsMap[t.id] = {
        id: `std-${t.id}`,
        competitionId,
        teamId: t.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Populate from completed matches
    fixtures.forEach((f) => {
      const homeStd = standingsMap[f.homeTeamId];
      const awayStd = standingsMap[f.awayTeamId];

      // Only process matches with appropriate finished statuses
      if (!homeStd || !awayStd) return;

      if (f.status === 'full_time' || f.status === 'published') {
        const hScore = f.homeScore ?? 0;
        const aScore = f.awayScore ?? 0;

        homeStd.played += 1;
        awayStd.played += 1;
        homeStd.goalsFor += hScore;
        homeStd.goalsAgainst += aScore;
        awayStd.goalsFor += aScore;
        awayStd.goalsAgainst += hScore;

        if (hScore > aScore) {
          homeStd.won += 1;
          homeStd.points += rules.pointsForWin;
          awayStd.lost += 1;
          awayStd.points += rules.pointsForLoss;
        } else if (hScore < aScore) {
          awayStd.won += 1;
          awayStd.points += rules.pointsForWin;
          homeStd.lost += 1;
          homeStd.points += rules.pointsForLoss;
        } else {
          homeStd.drawn += 1;
          homeStd.points += rules.pointsForDraw;
          awayStd.drawn += 1;
          awayStd.points += rules.pointsForDraw;
        }
      } else if (f.status === 'walkover') {
        homeStd.played += 1;
        awayStd.played += 1;

        if (f.walkoverTeamId === f.homeTeamId) {
          // Home wins by walkover
          const hScore = rules.walkoverDefaultScoreHome ?? 3;
          const aScore = rules.walkoverDefaultScoreAway ?? 0;

          homeStd.goalsFor += hScore;
          homeStd.goalsAgainst += aScore;
          awayStd.goalsFor += aScore;
          awayStd.goalsAgainst += hScore;

          homeStd.won += 1;
          homeStd.points += rules.pointsForWin;
          awayStd.lost += 1;
          awayStd.points += rules.pointsForLoss;
        } else if (f.walkoverTeamId === f.awayTeamId) {
          // Away wins by walkover
          const hScore = rules.walkoverDefaultScoreAway ?? 0;
          const aScore = rules.walkoverDefaultScoreHome ?? 3;

          homeStd.goalsFor += hScore;
          homeStd.goalsAgainst += aScore;
          awayStd.goalsFor += aScore;
          awayStd.goalsAgainst += hScore;

          awayStd.won += 1;
          awayStd.points += rules.pointsForWin;
          homeStd.lost += 1;
          homeStd.points += rules.pointsForLoss;
        }
      }
    });

    // Compute goal difference and convert map to array
    const standingsList = Object.values(standingsMap).map((std) => {
      std.goalDifference = std.goalsFor - std.goalsAgainst;
      return std;
    });

    // Sort: 1) Points desc, 2) Goal Diff desc, 3) Goals For desc
    standingsList.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Set positions
    standingsList.forEach((std, index) => {
      std.position = index + 1;
    });

    return standingsList;
  },
};
