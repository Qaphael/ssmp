import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ============================================================================
// Constants
// ============================================================================

export const POSITIONS_BY_SPORT = {
  football: ['goalkeeper', 'defender', 'midfielder', 'forward'] as const,
  basketball: ['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center'] as const,
  volleyball: ['setter', 'outside_hitter', 'opposite_hitter', 'middle_blocker', 'libero'] as const,
  athletics: ['sprinter', 'distance', 'jumper', 'thrower', 'heptathlete'] as const,
  swimming: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley'] as const,
} as const;

export const CSV_IMPORT_COLUMNS = [
  'first_name',
  'last_name',
  'jersey_number',
  'position',
  'date_of_birth',
  'nationality',
  'height',
  'weight',
] as const;

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
// Auth Schemas
// ============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: UserRoleSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(128),
});
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128),
});
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

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
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8).max(128),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ============================================================================
// Query / Filter Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const CompetitionFilterSchema = PaginationSchema.extend({
  seasonId: z.string().uuid().optional(),
  sport: SportSchema.optional(),
  status: CompetitionStatusSchema.optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['name', 'createdAt', 'status']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});
export type CompetitionFilter = z.infer<typeof CompetitionFilterSchema>;

export const TeamFilterSchema = PaginationSchema.extend({
  competitionId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  registrationStatus: RegistrationStatusSchema.optional(),
  rosterApprovalStatus: RosterApprovalStatusSchema.optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['name', 'schoolName', 'createdAt']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});
export type TeamFilter = z.infer<typeof TeamFilterSchema>;

export const PlayerFilterSchema = PaginationSchema.extend({
  teamId: z.string().uuid().optional(),
  status: PlayerStatusSchema.optional(),
  position: z.string().max(50).optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['lastName', 'jerseyNumber', 'createdAt']).default('lastName'),
  sortOrder: SortOrderSchema.default('asc'),
});
export type PlayerFilter = z.infer<typeof PlayerFilterSchema>;

export const MatchFilterSchema = PaginationSchema.extend({
  competitionId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  status: MatchStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  matchday: z.number().int().min(1).optional(),
  sortBy: z.enum(['scheduledAt', 'status', 'createdAt']).default('scheduledAt'),
  sortOrder: SortOrderSchema.default('asc'),
});
export type MatchFilter = z.infer<typeof MatchFilterSchema>;

export const RegistrationFilterSchema = PaginationSchema.extend({
  competitionId: z.string().uuid().optional(),
  status: RegistrationStatusSchema.optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['teamName', 'schoolName', 'createdAt']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});
export type RegistrationFilter = z.infer<typeof RegistrationFilterSchema>;

export const OfficialFilterSchema = PaginationSchema.extend({
  search: z.string().max(255).optional(),
  certification: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: SortOrderSchema.default('asc'),
});
export type OfficialFilter = z.infer<typeof OfficialFilterSchema>;

export const AuditLogFilterSchema = PaginationSchema.extend({
  userId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});
export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;

// ============================================================================
// CSV Import Schema
// ============================================================================

export const CsvImportRowSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  jersey_number: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 99) throw new Error('Invalid jersey number');
    return num;
  }),
  position: z.string().max(50).optional(),
  date_of_birth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).transform((val) => new Date(val)),
  nationality: z.string().max(100).optional(),
  height: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  weight: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
});
export type CsvImportRow = z.infer<typeof CsvImportRowSchema>;

export const CsvImportResultSchema = z.object({
  totalRows: z.number().int().min(0),
  successCount: z.number().int().min(0),
  errorCount: z.number().int().min(0),
  errors: z.array(z.object({
    row: z.number().int().min(1),
    field: z.string(),
    message: z.string(),
  })),
});
export type CsvImportResult = z.infer<typeof CsvImportResultSchema>;

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
  createdAt: z.string(),
  updatedAt: z.string(),
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
  startDate: z.string(),
  endDate: z.string(),
  isArchived: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Season = z.infer<typeof SeasonSchema>;

export const CreateSeasonSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});
export type CreateSeason = z.infer<typeof CreateSeasonSchema>;

export const UpdateSeasonSchema = z.object({
  organizationId: z.string().uuid().optional(),
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) return data.endDate > data.startDate;
    return true;
  },
  { message: 'End date must be after start date', path: ['endDate'] }
);
export type UpdateSeason = z.infer<typeof UpdateSeasonSchema>;

// ============================================================================
// Competition
// ============================================================================

export const CompetitionRulesSchema = z.object({
  pointsForWin: z.number().int().min(0).default(3),
  pointsForDraw: z.number().int().min(0).default(1),
  pointsForLoss: z.number().int().min(0).default(0),
  matchDurationMinutes: z.number().int().min(15).max(120).default(90),
  halfTimeDurationMinutes: z.number().int().min(0).max(30).default(15),
  extraTimeDurationMinutes: z.number().int().min(0).max(30).default(15),
  allowedSubstitutions: z.number().int().min(0).max(12).default(5),
  yellowCardsForSuspension: z.number().int().min(1).max(10).default(2),
  suspensionMatches: z.number().int().min(1).max(10).default(1),
  redCardImmediateSuspension: z.boolean().default(true),
  walkoverDefaultScoreHome: z.number().int().min(0).max(99).default(3),
  walkoverDefaultScoreAway: z.number().int().min(0).max(99).default(0),
});
export type CompetitionRules = z.infer<typeof CompetitionRulesSchema>;

export const RegistrationWindowSchema = z.object({
  opensAt: z.string(),
  closesAt: z.string(),
}).refine((data) => data.closesAt > data.opensAt, {
  message: 'Registration must close after it opens',
  path: ['closesAt'],
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
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Competition = z.infer<typeof CompetitionSchema>;

export const CreateCompetitionSchema = z.object({
  seasonId: z.string().uuid(),
  name: z.string().min(1).max(255),
  sport: SportSchema,
  division: z.string().max(100).optional(),
  rules: CompetitionRulesSchema.partial().optional(),
  registrationWindow: RegistrationWindowSchema,
  enableGroups: z.boolean().default(false),
  enableKnockouts: z.boolean().default(false),
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
  createdAt: z.string(),
  updatedAt: z.string(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
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
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  registrationStatus: RegistrationStatusSchema,
  rosterApprovalStatus: RosterApprovalStatusSchema,
  coachId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Team = z.infer<typeof TeamSchema>;

export const CreateTeamSchema = z.object({
  competitionId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  schoolName: z.string().min(1).max(255),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
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
  dateOfBirth: z.string(),
  nationality: z.string().max(100).optional(),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(300).optional(),
  photoUrl: z.string().url().optional(),
  status: PlayerStatusSchema,
  injuryDetails: z
    .object({
      description: z.string().min(1).max(500),
      expectedReturnDate: z.string(),
      medicalNotes: z.string().max(1000).optional(),
    })
    .optional(),
  suspensionDetails: z
    .object({
      reason: z.string().min(1).max(500),
      matchesRemaining: z.number().int().min(0),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const CreatePlayerSchema = z.object({
  teamId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  jerseyNumber: z.number().int().min(0).max(99),
  position: z.string().max(50).optional(),
  dateOfBirth: z.string(),
  nationality: z.string().max(100).optional(),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(300).optional(),
  photoUrl: z.string().url().optional(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
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
  certifications: z.array(z.string().max(100)).optional(),
  availability: z
    .object({
      weekdayEvenings: z.boolean().default(true),
      weekends: z.boolean().default(true),
      holidays: z.boolean().default(false),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
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
  reviewedAt: z.string().optional(),
  rejectionReason: z.string().max(500).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TeamRegistration = z.infer<typeof TeamRegistrationSchema>;

export const CreateTeamRegistrationSchema = z.object({
  competitionId: z.string().uuid(),
  teamName: z.string().min(1).max(255),
  schoolName: z.string().min(1).max(255),
  coachEmail: z.string().email(),
  coachFirstName: z.string().min(1).max(100),
  coachLastName: z.string().min(1).max(100),
});
export type CreateTeamRegistration = z.infer<typeof CreateTeamRegistrationSchema>;

export const ReviewRegistrationSchema = z.object({
  status: RegistrationStatusSchema.extract(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
}).refine(
  (data) => data.status === 'approved' || (data.status === 'rejected' && data.rejectionReason),
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] }
);
export type ReviewRegistration = z.infer<typeof ReviewRegistrationSchema>;

// ============================================================================
// Roster Submission
// ============================================================================

export const RosterSubmissionSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).refine(
    (ids) => new Set(ids).size === ids.length,
    { message: 'Player IDs must be unique' }
  ),
  status: RosterApprovalStatusSchema,
  submittedBy: z.string().uuid(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().optional(),
  rejectionReason: z.string().max(500).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RosterSubmission = z.infer<typeof RosterSubmissionSchema>;

export const CreateRosterSubmissionSchema = z.object({
  teamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).refine(
    (ids) => new Set(ids).size === ids.length,
    { message: 'Player IDs must be unique' }
  ),
});
export type CreateRosterSubmission = z.infer<typeof CreateRosterSubmissionSchema>;

export const ReviewRosterSchema = z.object({
  status: RosterApprovalStatusSchema.extract(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
}).refine(
  (data) => data.status === 'approved' || (data.status === 'rejected' && data.rejectionReason),
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] }
);
export type ReviewRoster = z.infer<typeof ReviewRosterSchema>;

// ============================================================================
// Transfer Request
// ============================================================================

export const TransferRequestSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  fromTeamId: z.string().uuid(),
  toTeamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  status: TransferStatusSchema,
  requestedBy: z.string().uuid(),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().optional(),
  rejectionReason: z.string().max(500).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).refine((data) => data.fromTeamId !== data.toTeamId, {
  message: 'Cannot transfer to the same team',
  path: ['toTeamId'],
});
export type TransferRequest = z.infer<typeof TransferRequestSchema>;

export const CreateTransferRequestSchema = z.object({
  playerId: z.string().uuid(),
  fromTeamId: z.string().uuid(),
  toTeamId: z.string().uuid(),
  competitionId: z.string().uuid(),
  reason: z.string().min(1).max(500),
}).refine((data) => data.fromTeamId !== data.toTeamId, {
  message: 'Cannot transfer to the same team',
  path: ['toTeamId'],
});
export type CreateTransferRequest = z.infer<typeof CreateTransferRequestSchema>;

export const ReviewTransferSchema = z.object({
  status: TransferStatusSchema.extract(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
}).refine(
  (data) => data.status === 'approved' || (data.status === 'rejected' && data.rejectionReason),
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] }
);
export type ReviewTransfer = z.infer<typeof ReviewTransferSchema>;

// ============================================================================
// Fixture
// ============================================================================

export const FixtureSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
  matchday: z.number().int().min(1),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  scheduledAt: z.string(),
  pitchId: z.string().uuid().optional(),
  status: MatchStatusSchema,
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  officialId: z.string().uuid().optional(),
  postponedReason: z.string().optional(),
  walkoverTeamId: z.string().uuid().optional(),
  walkoverReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Fixture = z.infer<typeof FixtureSchema>;

export const CreateFixtureSchema = z.object({
  competitionId: z.string().uuid(),
  matchday: z.number().int().min(1),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  scheduledAt: z.string(),
  pitchId: z.string().uuid().optional(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: 'Home and away teams must be different',
  path: ['awayTeamId'],
});
export type CreateFixture = z.infer<typeof CreateFixtureSchema>;

export const UpdateFixtureSchema = z.object({
  competitionId: z.string().uuid().optional(),
  matchday: z.number().int().min(1).optional(),
  homeTeamId: z.string().uuid().optional(),
  awayTeamId: z.string().uuid().optional(),
  scheduledAt: z.string().optional(),
  pitchId: z.string().uuid().optional(),
}).refine(
  (data) => {
    if (data.homeTeamId && data.awayTeamId) return data.homeTeamId !== data.awayTeamId;
    return true;
  },
  { message: 'Home and away teams must be different', path: ['awayTeamId'] }
);
export type UpdateFixture = z.infer<typeof UpdateFixtureSchema>;

export const BulkCreateFixtureSchema = z.object({
  competitionId: z.string().uuid(),
  fixtures: z.array(CreateFixtureSchema).min(1).max(100),
});
export type BulkCreateFixture = z.infer<typeof BulkCreateFixtureSchema>;

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
  scheduledAt: z.string(),
  startedAt: z.string().optional(),
  halfTimeAt: z.string().optional(),
  endedAt: z.string().optional(),
  extraTimeEnabled: z.boolean().default(false),
  penaltiesEnabled: z.boolean().default(false),
  homePenalties: z.number().int().min(0).optional(),
  awayPenalties: z.number().int().min(0).optional(),
  officialId: z.string().uuid().optional(),
  reportSubmittedAt: z.string().optional(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().uuid().optional(),
  publishedAt: z.string().optional(),
  walkoverTeamId: z.string().uuid().optional(),
  walkoverReason: z.string().max(500).optional(),
  postponedReason: z.string().max(500).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: 'Home and away teams must be different',
  path: ['awayTeamId'],
});
export type Match = z.infer<typeof MatchSchema>;

export const CreateMatchSchema = z.object({
  fixtureId: z.string().uuid(),
  competitionId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  scheduledAt: z.string(),
  pitchId: z.string().uuid().optional(),
  officialId: z.string().uuid().optional(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: 'Home and away teams must be different',
  path: ['awayTeamId'],
});
export type CreateMatch = z.infer<typeof CreateMatchSchema>;

export const UpdateMatchStatusSchema = z.object({
  status: MatchStatusSchema,
});
export type UpdateMatchStatus = z.infer<typeof UpdateMatchStatusSchema>;

export const RecordWalkoverSchema = z.object({
  walkoverTeamId: z.string().uuid(),
  walkoverReason: z.string().min(1).max(500),
});
export type RecordWalkover = z.infer<typeof RecordWalkoverSchema>;

export const RecordPostponementSchema = z.object({
  postponedReason: z.string().min(1).max(500),
  newScheduledAt: z.string().optional(),
});
export type RecordPostponement = z.infer<typeof RecordPostponementSchema>;

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
  description: z.string().max(500).optional(),
  recordedBy: z.string().uuid(),
  createdAt: z.string(),
});
export type MatchEvent = z.infer<typeof MatchEventSchema>;

export const CreateMatchEventSchema = z.object({
  matchId: z.string().uuid(),
  type: MatchEventTypeSchema,
  minute: z.number().int().min(0).max(120),
  playerId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  recordedBy: z.string().uuid(),
});
export type CreateMatchEvent = z.infer<typeof CreateMatchEventSchema>;

// ============================================================================
// Lineup
// ============================================================================

export const LineupSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).max(20).refine(
    (ids) => new Set(ids).size === ids.length,
    { message: 'Player IDs must be unique' }
  ),
  isStarting: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  submittedBy: z.string().uuid(),
  submittedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lineup = z.infer<typeof LineupSchema>;

export const CreateLineupSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).max(20).refine(
    (ids) => new Set(ids).size === ids.length,
    { message: 'Player IDs must be unique' }
  ),
  isStarting: z.boolean().default(true),
  submittedBy: z.string().uuid(),
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
  reason: z.string().max(500).optional(),
  competitionId: z.string().uuid(),
  createdAt: z.string(),
});
export type Card = z.infer<typeof CardSchema>;

export const CreateCardSchema = z.object({
  matchId: z.string().uuid(),
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  type: CardTypeSchema,
  minute: z.number().int().min(0).max(120),
  reason: z.string().max(500).optional(),
  competitionId: z.string().uuid(),
});
export type CreateCard = z.infer<typeof CreateCardSchema>;

// ============================================================================
// Suspension
// ============================================================================

export const SuspensionSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  competitionId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  matchesCount: z.number().int().min(1),
  matchesServed: z.number().int().min(0).default(0),
  cardId: z.string().uuid().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isServed: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
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
  readAt: z.string().optional(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const MarkNotificationReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
export type MarkNotificationRead = z.infer<typeof MarkNotificationReadSchema>;

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
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  createdAt: z.string(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Media = z.infer<typeof MediaSchema>;

export const CreateMediaSchema = z.object({
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
});
export type CreateMedia = z.infer<typeof CreateMediaSchema>;

export const ApproveMediaSchema = z.object({
  approvedBy: z.string().uuid(),
});
export type ApproveMedia = z.infer<typeof ApproveMediaSchema>;

export const NewsArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  authorId: z.string().uuid(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
  competitionId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const CreateNewsArticleSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  authorId: z.string().uuid(),
  competitionId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
});
export type CreateNewsArticle = z.infer<typeof CreateNewsArticleSchema>;

export const UpdateNewsArticleSchema = CreateNewsArticleSchema.partial();
export type UpdateNewsArticle = z.infer<typeof UpdateNewsArticleSchema>;

export const PublishNewsArticleSchema = z.object({
  isPublished: z.boolean(),
});
export type PublishNewsArticle = z.infer<typeof PublishNewsArticleSchema>;

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
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Standing = z.infer<typeof StandingSchema>;

// ============================================================================
// API Response Helpers
// ============================================================================

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.discriminatedUnion('success', [
    ApiSuccessSchema(dataSchema),
    ApiErrorSchema,
  ]);

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      total: z.number().int().min(0),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      totalPages: z.number().int().min(0),
    }),
  });

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof IdParamSchema>;

export const CompetitionIdParamSchema = z.object({
  competitionId: z.string().uuid(),
});
export type CompetitionIdParam = z.infer<typeof CompetitionIdParamSchema>;

export const SeasonIdParamSchema = z.object({
  seasonId: z.string().uuid(),
});
export type SeasonIdParam = z.infer<typeof SeasonIdParamSchema>;

export const TeamIdParamSchema = z.object({
  teamId: z.string().uuid(),
});
export type TeamIdParam = z.infer<typeof TeamIdParamSchema>;

export const MatchIdParamSchema = z.object({
  matchId: z.string().uuid(),
});
export type MatchIdParam = z.infer<typeof MatchIdParamSchema>;

// ============================================================================
// WebSocket Event Schemas
// ============================================================================

export const WsMatchEventSchema = z.object({
  type: z.literal('match_event'),
  matchId: z.string().uuid(),
  event: MatchEventSchema,
});
export type WsMatchEvent = z.infer<typeof WsMatchEventSchema>;

export const WsScoreUpdateSchema = z.object({
  type: z.literal('score_update'),
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});
export type WsScoreUpdate = z.infer<typeof WsScoreUpdateSchema>;

export const WsMatchStatusChangeSchema = z.object({
  type: z.literal('match_status_change'),
  matchId: z.string().uuid(),
  status: MatchStatusSchema,
  timestamp: z.string(),
});
export type WsMatchStatusChange = z.infer<typeof WsMatchStatusChangeSchema>;

export const WsStandingUpdateSchema = z.object({
  type: z.literal('standing_update'),
  competitionId: z.string().uuid(),
  standings: z.array(StandingSchema),
});
export type WsStandingUpdate = z.infer<typeof WsStandingUpdateSchema>;

export const WsNotificationSchema = z.object({
  type: z.literal('notification'),
  notification: NotificationSchema,
});
export type WsNotification = z.infer<typeof WsNotificationSchema>;

export const WsEventSchema = z.discriminatedUnion('type', [
  WsMatchEventSchema,
  WsScoreUpdateSchema,
  WsMatchStatusChangeSchema,
  WsStandingUpdateSchema,
  WsNotificationSchema,
]);
export type WsEvent = z.infer<typeof WsEventSchema>;
