const { hasPermission } = require('./permissions');

/**
 * Role-Based Access Control middleware
 *
 * Usage:
 *   rbac('team:create')           — check a single permission
 *   rbac('team:list', 'team:read') — check ANY of the listed permissions
 */
function rbac(...permissionKeys) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const role = req.user.role;
    const allowed = permissionKeys.some((key) => hasPermission(role, key));

    if (!allowed) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permissionKeys,
        role,
      });
    }

    next();
  };
}

/**
 * Check if user is the coach of the team being accessed
 * Used for ownership-based authorization (coach can only edit their own team/players)
 */
function isTeamCoach(req, res, next) {
  if (req.user.role !== 'coach') return next();
  if (req.teamId && req.user.teamId !== req.teamId) {
    return res.status(403).json({ error: 'Not authorized to access this team' });
  }
  next();
}

module.exports = { rbac, isTeamCoach };
