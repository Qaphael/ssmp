import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const SportSchema = z.enum([
  'football',
  'basketball',
  'volleyball',
  'athletics',
  'swimming',
  'other',
]);
export type Sport = z.infer<typeof SportSchema>;

export const UserRoleSchema = z.enum([
  'system_admin',
  'comp_admin',
  'registrar',
  'referee_coordinator',
  'media_officer',
  'official',
  'coach',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const CompetitionStatusSchema = z.enum([
  'draft',
  'setup',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'archived',
]);
export type CompetitionStatus = z.infer<typeof CompetitionStatusSchema>;

export const RegistrationStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
]);
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;

export const RosterApprovalStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
]);
export type RosterApprovalStatus = z.infer<typeof RosterApprovalStatusSchema>;

export const PlayerStatusSchema = z.enum([
  'active',
  'injured',
  'suspended',
  'inactive',
]);
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const TransferStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const MatchStatusSchema = z.enum([
  'scheduled',
  'officials_assigned',
  'lineups_submitted',
  'lineups_locked',
  'kickoff',
  'half_time',
  'second_half',
  'extra_time',
  'penalties',
  'full_time',
  'report_submitted',
  'verified',
  'published',
  'postponed',
  'cancelled',
  'abandoned',
  'walkover',
]);
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

export const CardTypeSchema = z.enum(['yellow', 'red']);
export type CardType = z.infer<typeof CardTypeSchema>;

export const OfficialAttendanceSchema = z.enum(['present', 'absent', 'late']);
export type OfficialAttendance = z.infer<typeof OfficialAttendanceSchema>;

export const NotificationTypeSchema = z.enum([
  'fixture_published',
  'fixture_changed',
  'official_assigned',
  'roster_approved',
  'roster_rejected',
  'transfer_approved',
  'transfer_rejected',
  'suspension_applied',
  'kickoff_reminder',
  'match_postponed',
  'match_cancelled',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const MediaTypeSchema = z.enum([
  'logo',
  'photo',
  'video',
  'document',
]);
export type MediaType = z.infer<typeof MediaTypeSchema>;

// ============================================================================
// User
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ============================================================================
// Organization
// ============================================================================

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;

// ============================================================================
// Season
// ============================================================================

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  isArchived: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Season = z.infer<typeof SeasonSchema>;

export const CreateSeasonSchema = SeasonSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateSeason = z.infer<typeof CreateSeasonSchema>;

export const UpdateSeasonSchema = CreateSeasonSchema.partial();
export type UpdateSeason = z.infer<typeof UpdateSeasonSchema>;

// ============================================================================
// Competition
// ============================================================================

export const CompetitionRulesSchema = z.object({
  pointsForWin: z.number().int().min(0).default(3),
  pointsForDraw: z.number().int().min(0).default(1),
  pointsForLoss: z.number().int().min(0).default(0),
  matchDurationMinutes: z.number().int().min(1).default(90),
  halfTimeDurationMinutes: z.number().int().min(0).default(15),
  extraTimeDurationMinutes: z.number().int().min(0).default(15),
  allowedSubstitutions: z.number().int().min(0).default(5),
  yellowCardsForSuspension: z.number().int().min(1).default(2),
  suspensionMatches: z.number().int().min(1).default(1),
  redCardImmediateSuspension: z.boolean().default(true),
  walkoverDefaultScoreHome: z.number().int().min(0).default(3),
  walkoverDefaultScoreAway: z.number().int().min(0).default(0),
});
export type CompetitionRules = z.infer<typeof CompetitionRulesSchema>;

export const RegistrationWindowSchema = z.object({
  opensAt: z.date(),
  closesAt: z.date(),
});
export type RegistrationWindow = z.infer<typeof RegistrationWindowSchema>;

export const CompetitionSchema = z.object({
  id: z.string().uuid(),
  seasonId: z.string().uuid(),
  name: z.string().min(1).max(255),
  sport: SportSchema,
  division: z.string().max(100).optional(),
  status: CompetitionStatusSchema,
  rules: CompetitionRulesSchema,
  registrationWindow: RegistrationWindowSchema,
  enableGroups: z.boolean().default(false),
  enableKnockouts: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Competition = z.infer<typeof CompetitionSchema>;

export const CreateCompetitionSchema = CompetitionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rules: CompetitionRulesSchema.partial().optional(),
  registrationWindow: RegistrationWindowSchema,
});
export type CreateCompetition = z.infer<typeof CreateCompetitionSchema>;

export const UpdateCompetitionSchema = CreateCompetitionSchema.partial();
export type UpdateCompetition = z.infer<typeof UpdateCompetitionSchema>;

// ============================================================================
// Group
// ============================================================================

export const GroupSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  name: z.string().min(1).max(50),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Group = z.infer<typeof GroupSchema>;

export const CreateGroupSchema = GroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateGroup = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = CreateGroupSchema.partial();
export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;

// ============================================================================
// Pitch / Venue
// ============================================================================

export const PitchSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  surfaceType: z.string().max(50).optional(),
  isAvailable: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Pitch = z.infer<typeof PitchSchema>;

export const CreatePitchSchema = PitchSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreatePitch = z.infer<typeof CreatePitchSchema>;

export const UpdatePitchSchema = CreatePitchSchema.partial();
export type UpdatePitch = z.infer<typeof UpdatePitchSchema>;

// ============================================================================
// Team (School)
// ============================================================================

export const TeamSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  schoolName: z.string().min(1).max(255),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().max(7).optional(),
  secondaryColor: z.string().max(7).optional(),
  registrationStatus: RegistrationStatusSchema,
  rosterApprovalStatus: RosterApprovalStatusSchema,
  coachId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Team = z.infer<typeof TeamSchema>;

export const CreateTeamSchema = TeamSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  registrationStatus: true,
  rosterApprovalStatus: true,
  coachId: true,
});
export type CreateTeam = z.infer<typeof CreateTeamSchema>;

export const UpdateTeamSchema = CreateTeamSchema.partial();
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;

// ============================================================================
// Player
// ============================================================================

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  jerseyNumber: z.number().int().min(0).max(99),
  position: z.string().max(50).optional(),
  dateOfBirth: z.date(),
  nationality: z.string().max(100).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  photoUrl: z.string().url().optional(),
  status: PlayerStatusSchema,
  injuryDetails: z
    .object({
      description: z.string(),
      expectedReturnDate: z.date(),
      medicalNotes: z.string().optional(),
    })
    .optional(),
  suspensionDetails: z
    .object({
      reason: z.string(),
      matchesRemaining: z.number().int().min(0),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const CreatePlayerSchema = PlayerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  injuryDetails: true,
  suspensionDetails: true,
}).extend({
  jerseyNumber: z.number().int().min(0).max(99),
});
export type CreatePlayer = z.infer<typeof CreatePlayerSchema>;

export const UpdatePlayerSchema = CreatePlayerSchema.partial();
export type UpdatePlayer = z.infer<typeof UpdatePlayerSchema>;

export const BulkImportPlayerSchema = CreatePlayerSchema.omit({
  teamId: true,
});
export type BulkImportPlayer = z.infer<typeof BulkImportPlayerSchema>;

// ============================================================================
// Coach (formerly Captain)
// ============================================================================

export const CoachSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Coach = z.infer<typeof CoachSchema>;

// ============================================================================
// Official (Referee)
// ============================================================================

export const OfficialSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  availability: z
    .object({
      weekdayEvenings: z.boolean().default(true),
      weekends: z.boolean().default(true),
      holidays: z.boolean().default(false),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Official = z.infer<typeof OfficialSchema>;

export const CreateOfficialSchema = OfficialSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOfficial = z.infer<typeof CreateOfficialSchema>;

export const UpdateOfficialSchema = CreateOfficialSchema.partial();
export type UpdateOfficial = z.infer<typeof UpdateOfficialSchema>;

// ============================================================================
// Registration (Team Application)
// ============================================================================

export const TeamRegistrationSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  teamName: z.string().min(1).max(255),
  schoolName: z.string().min(1).max(255),
  coachEmail: z.string().email(),
  coachFirstName: z.string().min(1).max(100),
  coachLastName: z.string().min(1).max(100),
  status: RegistrationStatusSchema,
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TeamRegistration = z.infer<typeof TeamRegistrationSchema>;

export const CreateTeamRegistrationSchema = TeamRegistrationSchema.omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateTeamRegistration = z.infer<typeof CreateTeamRegistrationSchema>;

// ============================================================================
// Roster Submission
// ============================================================================

export const RosterSubmissionSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()),
  status: RosterApprovalStatusSchema,
  submittedBy: z.string().uuid(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RosterSubmission = z.infer<typeof RosterSubmissionSchema>;

// ============================================================================
// Transfer Request
// ============================================================================

export const TransferRequestSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  fromTeamId: z.string().uuid(),
  toTeamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  reason: z.string().min(1),
  status: TransferStatusSchema,
  requestedBy: z.string().uuid(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TransferRequest = z.infer<typeof TransferRequestSchema>;

// ============================================================================
// Fixture
// ============================================================================

export const FixtureSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  matchday: z.number().int().min(1),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  scheduledAt: z.date(),
  pitchId: z.string().uuid().optional(),
  status: MatchStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Fixture = z.infer<typeof FixtureSchema>;

export const CreateFixtureSchema = FixtureSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateFixture = z.infer<typeof CreateFixtureSchema>;

export const UpdateFixtureSchema = CreateFixtureSchema.partial();
export type UpdateFixture = z.infer<typeof UpdateFixtureSchema>;

// ============================================================================
// Match
// ============================================================================

export const MatchSchema = z.object({
  id: z.string().uuid(),
  fixtureId: z.string().uuid(),
  competitionId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  homeScore: z.number().int().min(0).default(0),
  awayScore: z.number().int().min(0).default(0),
  status: MatchStatusSchema,
  pitchId: z.string().uuid().optional(),
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  halfTimeAt: z.date().optional(),
  endedAt: z.date().optional(),
  extraTimeEnabled: z.boolean().default(false),
  penaltiesEnabled: z.boolean().default(false),
  homePenalties: z.number().int().min(0).optional(),
  awayPenalties: z.number().int().min(0).optional(),
  officialId: z.string().uuid().optional(),
  reportSubmittedAt: z.date().optional(),
  verifiedAt: z.date().optional(),
  verifiedBy: z.string().uuid().optional(),
  publishedAt: z.date().optional(),
  walkoverTeamId: z.string().uuid().optional(),
  walkoverReason: z.string().optional(),
  postponedReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Match = z.infer<typeof MatchSchema>;

export const CreateMatchSchema = MatchSchema.omit({
  id: true,
  homeScore: true,
  awayScore: true,
  status: true,
  startedAt: true,
  halfTimeAt: true,
  endedAt: true,
  extraTimeEnabled: true,
  penaltiesEnabled: true,
  homePenalties: true,
  awayPenalties: true,
  officialId: true,
  reportSubmittedAt: true,
  verifiedAt: true,
  verifiedBy: true,
  publishedAt: true,
  walkoverTeamId: true,
  walkoverReason: true,
  postponedReason: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateMatch = z.infer<typeof CreateMatchSchema>;

export const UpdateMatchSchema = CreateMatchSchema.partial();
export type UpdateMatch = z.infer<typeof UpdateMatchSchema>;

// ============================================================================
// Match Event
// ============================================================================

export const MatchEventTypeSchema = z.enum([
  'kickoff',
  'goal',
  'own_goal',
  'assist',
  'yellow_card',
  'red_card',
  'substitution',
  'half_time',
  'full_time',
  'extra_time_start',
  'penalty_scored',
  'penalty_missed',
]);
export type MatchEventType = z.infer<typeof MatchEventTypeSchema>;

export const MatchEventSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  type: MatchEventTypeSchema,
  minute: z.number().int().min(0).max(120),
  playerId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  description: z.string().optional(),
  recordedBy: z.string().uuid(),
  createdAt: z.date(),
});
export type MatchEvent = z.infer<typeof MatchEventSchema>;

export const CreateMatchEventSchema = MatchEventSchema.omit({
  id: true,
  createdAt: true,
});
export type CreateMatchEvent = z.infer<typeof CreateMatchEventSchema>;

// ============================================================================
// Lineup
// ============================================================================

export const LineupSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).max(20),
  isStarting: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  submittedBy: z.string().uuid(),
  submittedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Lineup = z.infer<typeof LineupSchema>;

export const CreateLineupSchema = LineupSchema.omit({
  id: true,
  isLocked: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateLineup = z.infer<typeof CreateLineupSchema>;

// ============================================================================
// Card (Discipline)
// ============================================================================

export const CardSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  type: CardTypeSchema,
  minute: z.number().int().min(0).max(120),
  reason: z.string().optional(),
  competitionId: z.string().uuid(),
  createdAt: z.date(),
});
export type Card = z.infer<typeof CardSchema>;

export const CreateCardSchema = CardSchema.omit({
  id: true,
  createdAt: true,
});
export type CreateCard = z.infer<typeof CreateCardSchema>;

// ============================================================================
// Suspension
// ============================================================================

export const SuspensionSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  competitionId: z.string().uuid(),
  reason: z.string(),
  matchesCount: z.number().int().min(1),
  matchesServed: z.number().int().min(0).default(0),
  cardId: z.string().uuid().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  isServed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Suspension = z.infer<typeof SuspensionSchema>;

// ============================================================================
// Notification
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
  isRead: z.boolean().default(false),
  readAt: z.date().optional(),
  createdAt: z.date(),
});
export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================================
// Audit Log
// ============================================================================

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  oldValue: z.record(z.unknown()).optional(),
  newValue: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// ============================================================================
// Media / News
// ============================================================================

export const MediaSchema = z.object({
  id: z.string().uuid(),
  uploadedBy: z.string().uuid(),
  type: MediaTypeSchema,
  url: z.string().url(),
  filename: z.string().min(1).max(255),
  fileSize: z.number().int().min(0),
  mimeType: z.string().max(100),
  caption: z.string().max(500).optional(),
  matchId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  playerId: z.string().uuid().optional(),
  isApproved: z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Media = z.infer<typeof MediaSchema>;

export const CreateMediaSchema = MediaSchema.omit({
  id: true,
  isApproved: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateMedia = z.infer<typeof CreateMediaSchema>;

export const NewsArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  authorId: z.string().uuid(),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  competitionId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const CreateNewsArticleSchema = NewsArticleSchema.omit({
  id: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateNewsArticle = z.infer<typeof CreateNewsArticleSchema>;

// ============================================================================
// Standing
// ============================================================================

export const StandingSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  teamId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  played: z.number().int().min(0).default(0),
  won: z.number().int().min(0).default(0),
  drawn: z.number().int().min(0).default(0),
  lost: z.number().int().min(0).default(0),
  goalsFor: z.number().int().min(0).default(0),
  goalsAgainst: z.number().int().min(0).default(0),
  goalDifference: z.number().int().default(0),
  points: z.number().int().min(0).default(0),
  position: z.number().int().min(1).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Standing = z.infer<typeof StandingSchema>;

// ============================================================================
// Pagination & API Response Helpers
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  });

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
