import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

extendZodWithOpenApi(z);

import {
  UserSchema,
  OrganizationSchema,
  SeasonSchema,
  CompetitionSchema,
  GroupSchema,
  PitchSchema,
  TeamSchema,
  PlayerSchema,
  CoachSchema,
  OfficialSchema,
  TeamRegistrationSchema,
  RosterSubmissionSchema,
  TransferRequestSchema,
  FixtureSchema,
  MatchSchema,
  MatchEventSchema,
  LineupEntrySchema,
  LineupResponseSchema,
  CardSchema,
  SuspensionSchema,
  NotificationSchema,
  AuditLogSchema,
  MediaSchema,
  NewsArticleSchema,
  StandingSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  RefreshTokenRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  ChangePasswordSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  CreateSeasonSchema,
  UpdateSeasonSchema,
  CreateCompetitionSchema,
  UpdateCompetitionSchema,
  CreateGroupSchema,
  UpdateGroupSchema,
  CreatePitchSchema,
  UpdatePitchSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  CreatePlayerSchema,
  UpdatePlayerSchema,
  CreateOfficialSchema,
  UpdateOfficialSchema,
  CreateTeamRegistrationSchema,
  ReviewRegistrationSchema,
  CreateRosterSubmissionSchema,
  ReviewRosterSchema,
  CreateTransferRequestSchema,
  ReviewTransferSchema,
  CreateFixtureSchema,
  UpdateFixtureSchema,
  BulkCreateFixtureSchema,
  CreateMatchSchema,
  UpdateMatchStatusSchema,
  RecordWalkoverSchema,
  RecordPostponementSchema,
  CreateMatchEventSchema,
  SubmitLineupSchema,
  CreateCardSchema,
  MarkNotificationReadSchema,
  ApproveMediaSchema,
  CreateNewsArticleSchema,
  UpdateNewsArticleSchema,
  PublishNewsArticleSchema,
  CompetitionFilterSchema,
  TeamFilterSchema,
  PlayerFilterSchema,
  MatchFilterSchema,
  RegistrationFilterSchema,
  OfficialFilterSchema,
  AuditLogFilterSchema,
  PaginationSchema,
  SportSchema,
  UserRoleSchema,
  CompetitionStatusSchema,
  RegistrationStatusSchema,
  RosterApprovalStatusSchema,
  PlayerStatusSchema,
  TransferStatusSchema,
  MatchStatusSchema,
  CardTypeSchema,
  NotificationTypeSchema,
  MediaTypeSchema,
} from './index';

// ============================================================================
// Registry
// ============================================================================

export const registry = new OpenAPIRegistry();

// ============================================================================
// Security
// ============================================================================

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ============================================================================
// Registered Schemas (components/schemas)
// ============================================================================

registry.register('User', UserSchema);
registry.register('Organization', OrganizationSchema);
registry.register('Season', SeasonSchema);
registry.register('Competition', CompetitionSchema);
registry.register('Group', GroupSchema);
registry.register('Pitch', PitchSchema);
registry.register('Team', TeamSchema);
registry.register('Player', PlayerSchema);
registry.register('Coach', CoachSchema);
registry.register('Official', OfficialSchema);
registry.register('TeamRegistration', TeamRegistrationSchema);
registry.register('RosterSubmission', RosterSubmissionSchema);
registry.register('TransferRequest', TransferRequestSchema);
registry.register('Fixture', FixtureSchema);
registry.register('Match', MatchSchema);
registry.register('MatchEvent', MatchEventSchema);
registry.register('LineupEntry', LineupEntrySchema);
registry.register('LineupResponse', LineupResponseSchema);
registry.register('Card', CardSchema);
registry.register('Suspension', SuspensionSchema);
registry.register('Notification', NotificationSchema);
registry.register('AuditLog', AuditLogSchema);
registry.register('Media', MediaSchema);
registry.register('NewsArticle', NewsArticleSchema);
registry.register('Standing', StandingSchema);

// Enums
registry.register('Sport', SportSchema);
registry.register('UserRole', UserRoleSchema);
registry.register('CompetitionStatus', CompetitionStatusSchema);
registry.register('RegistrationStatus', RegistrationStatusSchema);
registry.register('RosterApprovalStatus', RosterApprovalStatusSchema);
registry.register('PlayerStatus', PlayerStatusSchema);
registry.register('TransferStatus', TransferStatusSchema);
registry.register('MatchStatus', MatchStatusSchema);
registry.register('CardType', CardTypeSchema);
registry.register('NotificationType', NotificationTypeSchema);
registry.register('MediaType', MediaTypeSchema);

// ============================================================================
// Paths (endpoints)
// ============================================================================

// --- Auth ---

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      content: { 'application/json': { schema: LoginRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: LoginResponseSchema } },
    },
    401: {
      description: 'Invalid credentials',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: { 'application/json': { schema: RegisterRequestSchema } },
    },
  },
  responses: {
    201: {
      description: 'User registered',
    },
    409: {
      description: 'Email already exists',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: {
    body: {
      content: { 'application/json': { schema: RefreshTokenRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Token refreshed',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/password-reset',
  tags: ['Auth'],
  summary: 'Request password reset',
  request: {
    body: {
      content: { 'application/json': { schema: PasswordResetRequestSchema } },
    },
  },
  responses: {
    200: {
      description: 'Reset email sent',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/password-reset/confirm',
  tags: ['Auth'],
  summary: 'Confirm password reset',
  request: {
    body: {
      content: { 'application/json': { schema: PasswordResetConfirmSchema } },
    },
  },
  responses: {
    200: {
      description: 'Password updated',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/change-password',
  tags: ['Auth'],
  summary: 'Change password (authenticated)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: ChangePasswordSchema } },
    },
  },
  responses: {
    200: {
      description: 'Password changed',
    },
  },
});

// --- Organizations ---

registry.registerPath({
  method: 'get',
  path: '/api/organizations',
  tags: ['Organizations'],
  summary: 'List organizations',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of organizations',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/organizations',
  tags: ['Organizations'],
  summary: 'Create organization',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateOrganizationSchema } },
    },
  },
  responses: {
    201: {
      description: 'Organization created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/organizations/{id}',
  tags: ['Organizations'],
  summary: 'Get organization by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Organization details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/organizations/{id}',
  tags: ['Organizations'],
  summary: 'Update organization',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateOrganizationSchema } },
    },
  },
  responses: {
    200: {
      description: 'Organization updated',
    },
  },
});

// --- Seasons ---

registry.registerPath({
  method: 'get',
  path: '/api/seasons',
  tags: ['Seasons'],
  summary: 'List seasons',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of seasons',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/seasons',
  tags: ['Seasons'],
  summary: 'Create season',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateSeasonSchema } },
    },
  },
  responses: {
    201: {
      description: 'Season created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/seasons/{id}',
  tags: ['Seasons'],
  summary: 'Get season by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Season details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/seasons/{id}',
  tags: ['Seasons'],
  summary: 'Update season',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateSeasonSchema } },
    },
  },
  responses: {
    200: {
      description: 'Season updated',
    },
  },
});

// --- Competitions ---

registry.registerPath({
  method: 'get',
  path: '/api/competitions',
  tags: ['Competitions'],
  summary: 'List competitions',
  security: [{ bearerAuth: [] }],
  request: {
    query: CompetitionFilterSchema,
  },
  responses: {
    200: {
      description: 'List of competitions',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/competitions',
  tags: ['Competitions'],
  summary: 'Create competition (Competition Wizard)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateCompetitionSchema } },
    },
  },
  responses: {
    201: {
      description: 'Competition created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{id}',
  tags: ['Competitions'],
  summary: 'Get competition by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Competition details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/competitions/{id}',
  tags: ['Competitions'],
  summary: 'Update competition',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateCompetitionSchema } },
    },
  },
  responses: {
    200: {
      description: 'Competition updated',
    },
  },
});

// --- Teams ---

registry.registerPath({
  method: 'get',
  path: '/api/teams',
  tags: ['Teams'],
  summary: 'List teams',
  security: [{ bearerAuth: [] }],
  request: {
    query: TeamFilterSchema,
  },
  responses: {
    200: {
      description: 'List of teams',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/teams',
  tags: ['Teams'],
  summary: 'Create team',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateTeamSchema } },
    },
  },
  responses: {
    201: {
      description: 'Team created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/teams/{id}',
  tags: ['Teams'],
  summary: 'Get team by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Team details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/teams/{id}',
  tags: ['Teams'],
  summary: 'Update team',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateTeamSchema } },
    },
  },
  responses: {
    200: {
      description: 'Team updated',
    },
  },
});

// --- Players ---

registry.registerPath({
  method: 'get',
  path: '/api/players',
  tags: ['Players'],
  summary: 'List players',
  security: [{ bearerAuth: [] }],
  request: {
    query: PlayerFilterSchema,
  },
  responses: {
    200: {
      description: 'List of players',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/players',
  tags: ['Players'],
  summary: 'Create player',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreatePlayerSchema } },
    },
  },
  responses: {
    201: {
      description: 'Player created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/players/{id}',
  tags: ['Players'],
  summary: 'Get player by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Player details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/players/{id}',
  tags: ['Players'],
  summary: 'Update player',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdatePlayerSchema } },
    },
  },
  responses: {
    200: {
      description: 'Player updated',
    },
  },
});

// --- Registrations ---

registry.registerPath({
  method: 'get',
  path: '/api/registrations',
  tags: ['Registrations'],
  summary: 'List team registrations',
  security: [{ bearerAuth: [] }],
  request: {
    query: RegistrationFilterSchema,
  },
  responses: {
    200: {
      description: 'List of registrations',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/registrations',
  tags: ['Registrations'],
  summary: 'Submit team registration',
  request: {
    body: {
      content: { 'application/json': { schema: CreateTeamRegistrationSchema } },
    },
  },
  responses: {
    201: {
      description: 'Registration submitted',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/registrations/{id}',
  tags: ['Registrations'],
  summary: 'Get registration by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Registration details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/registrations/{id}/review',
  tags: ['Registrations'],
  summary: 'Approve or reject registration',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: ReviewRegistrationSchema } },
    },
  },
  responses: {
    200: {
      description: 'Registration reviewed',
    },
  },
});

// --- Rosters ---

registry.registerPath({
  method: 'post',
  path: '/api/rosters',
  tags: ['Rosters'],
  summary: 'Submit roster for approval',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateRosterSubmissionSchema } },
    },
  },
  responses: {
    201: {
      description: 'Roster submitted',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/rosters/{id}',
  tags: ['Rosters'],
  summary: 'Get roster submission by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Roster details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/rosters/{id}/review',
  tags: ['Rosters'],
  summary: 'Approve or reject roster',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: ReviewRosterSchema } },
    },
  },
  responses: {
    200: {
      description: 'Roster reviewed',
    },
  },
});

// --- Transfers ---

registry.registerPath({
  method: 'get',
  path: '/api/transfers',
  tags: ['Transfers'],
  summary: 'List transfer requests',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of transfers',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/transfers',
  tags: ['Transfers'],
  summary: 'Submit transfer request',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateTransferRequestSchema } },
    },
  },
  responses: {
    201: {
      description: 'Transfer request submitted',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/transfers/{id}',
  tags: ['Transfers'],
  summary: 'Get transfer by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Transfer details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/transfers/{id}/review',
  tags: ['Transfers'],
  summary: 'Approve or reject transfer',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: ReviewTransferSchema } },
    },
  },
  responses: {
    200: {
      description: 'Transfer reviewed',
    },
  },
});

// --- Fixtures ---

registry.registerPath({
  method: 'get',
  path: '/api/fixtures',
  tags: ['Fixtures'],
  summary: 'List fixtures',
  security: [{ bearerAuth: [] }],
  request: {
    query: MatchFilterSchema,
  },
  responses: {
    200: {
      description: 'List of fixtures',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/fixtures',
  tags: ['Fixtures'],
  summary: 'Create fixture',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateFixtureSchema } },
    },
  },
  responses: {
    201: {
      description: 'Fixture created',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/fixtures/bulk',
  tags: ['Fixtures'],
  summary: 'Bulk create fixtures',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: BulkCreateFixtureSchema } },
    },
  },
  responses: {
    201: {
      description: 'Fixtures created',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/fixtures/{id}',
  tags: ['Fixtures'],
  summary: 'Update fixture',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateFixtureSchema } },
    },
  },
  responses: {
    200: {
      description: 'Fixture updated',
    },
  },
});

// --- Matches ---

registry.registerPath({
  method: 'get',
  path: '/api/matches',
  tags: ['Matches'],
  summary: 'List matches',
  security: [{ bearerAuth: [] }],
  request: {
    query: MatchFilterSchema,
  },
  responses: {
    200: {
      description: 'List of matches',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches',
  tags: ['Matches'],
  summary: 'Create match',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateMatchSchema } },
    },
  },
  responses: {
    201: {
      description: 'Match created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/matches/{id}',
  tags: ['Matches'],
  summary: 'Get match by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Match details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/matches/{id}/status',
  tags: ['Matches'],
  summary: 'Update match status',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateMatchStatusSchema } },
    },
  },
  responses: {
    200: {
      description: 'Match status updated',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{id}/walkover',
  tags: ['Matches'],
  summary: 'Record walkover',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: RecordWalkoverSchema } },
    },
  },
  responses: {
    200: {
      description: 'Walkover recorded',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{id}/postpone',
  tags: ['Matches'],
  summary: 'Postpone match',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: RecordPostponementSchema } },
    },
  },
  responses: {
    200: {
      description: 'Match postponed',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{id}/verify',
  tags: ['Matches'],
  summary: 'Verify match report',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Match verified and standings updated',
    },
  },
});

// --- Match Events ---

registry.registerPath({
  method: 'get',
  path: '/api/matches/{matchId}/events',
  tags: ['Match Events'],
  summary: 'List match events',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ matchId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'List of match events',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{matchId}/events',
  tags: ['Match Events'],
  summary: 'Record match event',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ matchId: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: CreateMatchEventSchema } },
    },
  },
  responses: {
    201: {
      description: 'Event recorded',
    },
  },
});

// --- Lineups ---

registry.registerPath({
  method: 'get',
  path: '/api/matches/{matchId}/lineup',
  tags: ['Lineups'],
  summary: 'Get lineups for match',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ matchId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Match lineups',
      content: { 'application/json': { schema: LineupResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{matchId}/lineup',
  tags: ['Lineups'],
  summary: 'Submit lineup',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ matchId: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: SubmitLineupSchema } },
    },
  },
  responses: {
    200: {
      description: 'Lineup submitted',
      content: { 'application/json': { schema: LineupResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{matchId}/lineup/lock',
  tags: ['Lineups'],
  summary: 'Lock lineups',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ matchId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Lineups locked',
      content: { 'application/json': { schema: LineupResponseSchema } },
    },
  },
});

// --- Standings ---

registry.registerPath({
  method: 'get',
  path: '/api/competitions/{competitionId}/standings',
  tags: ['Standings'],
  summary: 'Get competition standings',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ competitionId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Competition standings',
    },
  },
});

// --- Officials ---

registry.registerPath({
  method: 'get',
  path: '/api/officials',
  tags: ['Officials'],
  summary: 'List officials',
  security: [{ bearerAuth: [] }],
  request: {
    query: OfficialFilterSchema,
  },
  responses: {
    200: {
      description: 'List of officials',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/officials',
  tags: ['Officials'],
  summary: 'Create official',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateOfficialSchema } },
    },
  },
  responses: {
    201: {
      description: 'Official created',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/officials/{id}',
  tags: ['Officials'],
  summary: 'Get official by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Official details',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/officials/{id}',
  tags: ['Officials'],
  summary: 'Update official',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateOfficialSchema } },
    },
  },
  responses: {
    200: {
      description: 'Official updated',
    },
  },
});

// --- Notifications ---

registry.registerPath({
  method: 'get',
  path: '/api/notifications',
  tags: ['Notifications'],
  summary: 'List notifications',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of notifications',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/notifications/read',
  tags: ['Notifications'],
  summary: 'Mark notifications as read',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: MarkNotificationReadSchema } },
    },
  },
  responses: {
    200: {
      description: 'Notifications marked as read',
    },
  },
});

// --- Audit Logs ---

registry.registerPath({
  method: 'get',
  path: '/api/audit-logs',
  tags: ['Audit Logs'],
  summary: 'List audit logs',
  security: [{ bearerAuth: [] }],
  request: {
    query: AuditLogFilterSchema,
  },
  responses: {
    200: {
      description: 'List of audit logs',
    },
  },
});

// --- Media ---

registry.registerPath({
  method: 'get',
  path: '/api/media',
  tags: ['Media'],
  summary: 'List media',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of media',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/media/{id}/approve',
  tags: ['Media'],
  summary: 'Approve media',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: ApproveMediaSchema } },
    },
  },
  responses: {
    200: {
      description: 'Media approved',
    },
  },
});

// --- News ---

registry.registerPath({
  method: 'get',
  path: '/api/news',
  tags: ['News'],
  summary: 'List news articles',
  responses: {
    200: {
      description: 'List of news articles',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/news',
  tags: ['News'],
  summary: 'Create news article',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateNewsArticleSchema } },
    },
  },
  responses: {
    201: {
      description: 'News article created',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/news/{id}',
  tags: ['News'],
  summary: 'Update news article',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: UpdateNewsArticleSchema } },
    },
  },
  responses: {
    200: {
      description: 'News article updated',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/news/{id}/publish',
  tags: ['News'],
  summary: 'Publish/unpublish news article',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { 'application/json': { schema: PublishNewsArticleSchema } },
    },
  },
  responses: {
    200: {
      description: 'Publish status updated',
    },
  },
});

// ============================================================================
// Generator
// ============================================================================

export function generateOpenAPI(): OpenAPIObject {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'SSMP — School Sports Competition Management Platform',
      version: '1.0.0',
      description: 'Multi-sport competition management API. Single source of truth for all clients.',
      contact: {
        name: 'Qaphael Design',
        email: 'opiyoraphaellaflo@gmail.com',
      },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and authorization' },
      { name: 'Organizations', description: 'Top-level organization management' },
      { name: 'Seasons', description: 'Season management within organizations' },
      { name: 'Competitions', description: 'Competition setup and configuration' },
      { name: 'Teams', description: 'Team/school management' },
      { name: 'Players', description: 'Player roster management' },
      { name: 'Registrations', description: 'Team registration and approval' },
      { name: 'Rosters', description: 'Roster submission and approval' },
      { name: 'Transfers', description: 'Player transfer requests' },
      { name: 'Fixtures', description: 'Fixture generation and scheduling' },
      { name: 'Matches', description: 'Match lifecycle management' },
      { name: 'Match Events', description: 'Live match events (goals, cards, etc.)' },
      { name: 'Lineups', description: 'Team lineup submission' },
      { name: 'Standings', description: 'Competition standings' },
      { name: 'Officials', description: 'Referee/official management' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Audit Logs', description: 'System audit trail' },
      { name: 'Media', description: 'Media uploads and approval' },
      { name: 'News', description: 'News articles and announcements' },
    ],
  });
}
