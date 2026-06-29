const seasonService = require('./season.service');

class SeasonController {
  async list(req, res, next) {
    try {
      const result = await seasonService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const season = await seasonService.getById(req.params.id);
      if (!season) return res.status(404).json({ error: 'Season not found' });
      res.json({ success: true, data: season });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const season = await seasonService.create(req.body, auditCtx);
      res.status(201).json({ success: true, data: season });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const season = await seasonService.update(req.params.id, req.body, auditCtx);
      if (!season) return res.status(404).json({ error: 'Season not found' });
      res.json({ success: true, data: season });
    } catch (err) { next(err); }
  }

  async archive(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const season = await seasonService.archive(req.params.id, auditCtx);
      if (!season) return res.status(404).json({ error: 'Season not found' });
      res.json({ success: true, data: season });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const deleted = await seasonService.delete(req.params.id, auditCtx);
      if (!deleted) return res.status(404).json({ error: 'Season not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

module.exports = new SeasonController();
