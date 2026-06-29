const auditService = require('./audit.service');

class AuditController {
  async list(req, res, next) {
    try {
      const result = await auditService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const log = await auditService.getById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: 'Audit log not found' });
      }
      res.json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
