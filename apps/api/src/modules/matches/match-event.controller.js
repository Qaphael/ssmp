const matchEventService = require('./match-event.service');

class MatchEventController {
  async create(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const event = await matchEventService.create(req.params.id, req.body, req.user.id, req.user.role, auditCtx);
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }

  async listByMatch(req, res, next) {
    try {
      const events = await matchEventService.listByMatch(req.params.id);
      res.json({ success: true, data: events });
    } catch (err) { next(err); }
  }
}

module.exports = new MatchEventController();
