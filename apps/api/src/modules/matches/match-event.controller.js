const matchEventService = require('./match-event.service');

class MatchEventController {
  async create(req, res, next) {
    try {
      const event = await matchEventService.create(req.params.id, req.body, req.user.id);
      res.status(201).json({ success: true, data: event });
    } catch (err) { next(err); }
  }

  async listByMatch(req, res, next) {
    try {
      const events = await matchEventService.listByMatch(req.params.id);
      res.json({ success: true, data: events });
    } catch (err) { next(err); }
  }
}

module.exports = new MatchEventController();
