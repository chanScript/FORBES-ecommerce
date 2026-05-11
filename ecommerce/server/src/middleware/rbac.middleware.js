/**
 * RBAC Middleware — Role-Based Access Control
 *
 * Usage: rbac('Admin', 'Super Admin') — allows only those roles.
 * Must be placed AFTER auth.middleware.
 */
function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
}

module.exports = { rbac };
