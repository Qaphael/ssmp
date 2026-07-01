/**
 * RBAC Permissions Matrix based on SSMP-PRD.md section 5.1
 *
 * Roles:
 *   system_admin    - System Administrator
 *   comp_admin      - Competition Administrator
 *   registrar       - Registrar
 *   ref_coordinator - Referee Coordinator
 *   media_officer   - Media Officer
 *   official        - Official (Referee)
 *   coach           - Coach (formerly Captain)
 *   public          - Public (read-only, no login)
 */

const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  COMP_ADMIN: 'comp_admin',
  REGISTRAR: 'registrar',
  REF_COORDINATOR: 'ref_coordinator',
  MEDIA_OFFICER: 'media_officer',
  OFFICIAL: 'official',
  COACH: 'coach',
};

const ALL_AUTHENTICATED = [
  ROLES.SYSTEM_ADMIN,
  ROLES.COMP_ADMIN,
  ROLES.REGISTRAR,
  ROLES.REF_COORDINATOR,
  ROLES.MEDIA_OFFICER,
  ROLES.OFFICIAL,
  ROLES.COACH,
];

const ADMIN_ROLES = [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN];

/**
 * Permission definitions per resource/action
 * Each key maps to an array of roles allowed to perform that action
 */
const permissions = {
  // ─── Organizations ───────────────────────────────────────────────
  'organization:list':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'organization:read':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'organization:create': [ROLES.SYSTEM_ADMIN],
  'organization:update': [ROLES.SYSTEM_ADMIN],
  'organization:delete': [ROLES.SYSTEM_ADMIN],

  // ─── Seasons ─────────────────────────────────────────────────────
  'season:list':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'season:read':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'season:create':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'season:update':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'season:archive':      [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'season:delete':       [ROLES.SYSTEM_ADMIN],

  // ─── Competitions ────────────────────────────────────────────────
  'competition:list':    ALL_AUTHENTICATED,
  'competition:read':    ALL_AUTHENTICATED,
  'competition:create':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'competition:update':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'competition:delete':  [ROLES.SYSTEM_ADMIN],
  'competition:verify':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],

  // ─── Teams ───────────────────────────────────────────────────────
  'team:list':           [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'team:read':           [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'team:create':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'team:update':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],
  'team:delete':         [ROLES.SYSTEM_ADMIN],
  'team:assign-coach':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'team:approve-registration': [ROLES.SYSTEM_ADMIN, ROLES.REGISTRAR],
  'team:approve-roster':       [ROLES.SYSTEM_ADMIN, ROLES.REGISTRAR],

  // ─── Players ─────────────────────────────────────────────────────
  'player:list':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'player:read':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'player:create':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],
  'player:create-bulk':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],
  'player:update':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],
  'player:delete':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'player:update-injury':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],
  'player:clear-injury':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH],

  // ─── Officials ───────────────────────────────────────────────────
  'official:list':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REF_COORDINATOR],
  'official:read':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REF_COORDINATOR],
  'official:create':     [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REF_COORDINATOR],
  'official:update':     [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REF_COORDINATOR],
  'official:delete':     [ROLES.SYSTEM_ADMIN],
  'official:assign':     [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REF_COORDINATOR],

  // ─── Fixtures ────────────────────────────────────────────────────
  'fixture:list':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH, ROLES.OFFICIAL, ROLES.MEDIA_OFFICER],
  'fixture:read':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH, ROLES.OFFICIAL, ROLES.MEDIA_OFFICER],
  'fixture:create':      [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'fixture:update':      [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'fixture:delete':      [ROLES.SYSTEM_ADMIN],

  // ─── Matches ─────────────────────────────────────────────────────
  'match:list':          [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH, ROLES.OFFICIAL, ROLES.MEDIA_OFFICER],
  'match:read':          [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH, ROLES.OFFICIAL, ROLES.MEDIA_OFFICER],
  'match:create':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'match:update-status': [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.OFFICIAL],
  'match:record-event':  [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.OFFICIAL],
  'match:submit-report': [ROLES.OFFICIAL],
  'match:verify':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'match:walkover':      [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'match:postpone':      [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'match:correct-score': [ROLES.SYSTEM_ADMIN],

  // ─── Lineups ─────────────────────────────────────────────────────
  'lineup:read':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.COACH, ROLES.OFFICIAL],
  'lineup:submit':       [ROLES.COACH],
  'lineup:lock':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],

  // ─── Standings ───────────────────────────────────────────────────
  'standing:list':       ALL_AUTHENTICATED,
  'standing:read':       ALL_AUTHENTICATED,

  // ─── Registrations ───────────────────────────────────────────────
  'registration:list':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'registration:read':   [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR],
  'registration:create': [ROLES.COACH],
  'registration:review': [ROLES.SYSTEM_ADMIN, ROLES.REGISTRAR],

  // ─── Rosters ─────────────────────────────────────────────────────
  'roster:submit':       [ROLES.COACH],
  'roster:read':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'roster:review':       [ROLES.SYSTEM_ADMIN, ROLES.REGISTRAR],

  // ─── Transfers ───────────────────────────────────────────────────
  'transfer:list':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'transfer:read':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.REGISTRAR, ROLES.COACH],
  'transfer:create':     [ROLES.COACH],
  'transfer:review':     [ROLES.SYSTEM_ADMIN, ROLES.REGISTRAR],

  // ─── Notifications ───────────────────────────────────────────────
  'notification:list':   ALL_AUTHENTICATED,
  'notification:read':   ALL_AUTHENTICATED,

  // ─── Media ───────────────────────────────────────────────────────
  'media:list':          [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],
  'media:create':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],
  'media:approve':       [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],
  'media:delete':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],

  // ─── News ────────────────────────────────────────────────────────
  'news:list':           ALL_AUTHENTICATED,
  'news:read':           ALL_AUTHENTICATED,
  'news:create':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],
  'news:update':         [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],
  'news:publish':        [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN, ROLES.MEDIA_OFFICER],

  // ─── Audit Logs ──────────────────────────────────────────────────
  'audit:list':          [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],
  'audit:read':          [ROLES.SYSTEM_ADMIN, ROLES.COMP_ADMIN],

  // ─── Users ───────────────────────────────────────────────────────
  'user:list':           [ROLES.SYSTEM_ADMIN],
  'user:read':           [ROLES.SYSTEM_ADMIN],
  'user:create':         [ROLES.SYSTEM_ADMIN],
  'user:update':         [ROLES.SYSTEM_ADMIN],
  'user:delete':         [ROLES.SYSTEM_ADMIN],

  // ─── Settings ────────────────────────────────────────────────────
  'settings:read':       [ROLES.SYSTEM_ADMIN],
  'settings:update':     [ROLES.SYSTEM_ADMIN],
};

function getRolesForPermission(permission) {
  return permissions[permission] || [];
}

function hasPermission(role, permission) {
  const allowed = permissions[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

module.exports = { ROLES, permissions, getRolesForPermission, hasPermission };
