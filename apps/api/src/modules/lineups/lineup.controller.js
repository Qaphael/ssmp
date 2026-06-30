const lineupService = require('./lineup.service');

class LineupController {
  async submit(req, res, next) {
    try {
      const result = await lineupService.submit(req.params.id, req.body, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getByMatch(req, res, next) {
    try {
      const result = await lineupService.getByMatch(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async lock(req, res, next) {
    try {
      const result = await lineupService.lock(req.params.id, req.user.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LineupController();
