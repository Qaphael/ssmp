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
// Team (School)
// ============================================================================

export const TeamSchema = z.object({
  id: z.string().uuid(),
  competitionId: z.string().uuid(),
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
