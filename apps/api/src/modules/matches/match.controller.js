const matchService = require('./match.service');

class MatchController {
  async list(req, res, next) {
    try {
      const result = await matchService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const match = await matchService.getById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const match = await matchService.create(req.body);
      res.status(201).json({ success: true, data: match });
    } catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try {
      const match = await matchService.updateStatus(req.params.id, req.body.status, req.user.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) {
      if (err.message.includes('Invalid status transition')) {
        return res.status(422).json({ error: err.message });
      }
      next(err);
    }
  }

  async assignOfficial(req, res, next) {
    try {
      const match = await matchService.assignOfficial(req.params.id, req.body.officialId);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) { next(err); }
  }

  async submitReport(req, res, next) {
    try {
      const match = await matchService.submitReport(req.params.id, req.body);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) {
      if (err.message.includes('Match must be')) {
        return res.status(422).json({ error: err.message });
      }
      next(err);
    }
  }

  async verify(req, res, next) {
    try {
      const match = await matchService.verify(req.params.id, req.user.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) {
      if (err.message.includes('Match must be')) {
        return res.status(422).json({ error: err.message });
      }
      next(err);
    }
  }

  async publish(req, res, next) {
    try {
      const match = await matchService.publish(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) {
      if (err.message.includes('Match must be')) {
        return res.status(422).json({ error: err.message });
      }
      next(err);
    }
  }

  async recordWalkover(req, res, next) {
    try {
      const match = await matchService.recordWalkover(req.params.id, req.body.walkoverTeamId, req.body.walkoverReason);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) { next(err); }
  }

  async postpone(req, res, next) {
    try {
      const match = await matchService.postpone(req.params.id, req.body.postponedReason, req.body.newScheduledAt);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json({ success: true, data: match });
    } catch (err) { next(err); }
  }
}

module.exports = new MatchController();
