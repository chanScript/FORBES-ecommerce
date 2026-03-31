const prisma = require('../config/db');

/**
 * Audit Middleware Factory
 * Logs a state-changing action to audit_logs.
 *
 * Usage (as route-level after-handler):
 *   auditLog('CAR_APPROVED', 'cars')
 *
 * Expects req.user and req.auditRecordId to be set.
 */
function auditLog(action, module) {
  return async (req, _res, next) => {
    try {
      if (req.user && req.auditRecordId) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            module,
            recordId: req.auditRecordId,
            ipAddress: req.ip || req.connection?.remoteAddress || null,
          },
        });
      }
    } catch (err) {
      console.error('[Audit] Failed to log:', err.message);
    }
    // Audit logging never blocks the response
    if (next) next();
  };
}

/**
 * Helper to create audit log directly (for use inside controllers).
 */
async function createAuditLog({ userId, action, module, recordId, ipAddress, metadata }) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, module, recordId, ipAddress, metadata },
    });
  } catch (err) {
    console.error('[Audit] Failed to log:', err.message);
  }
}

module.exports = { auditLog, createAuditLog };
