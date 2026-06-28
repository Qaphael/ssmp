const competitionService = require('./competition.service');

class CompetitionController {
  async list(req, res, next) {
    try {
      const result = await competitionService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const comp = await competitionService.getById(req.params.id);
      if (!comp) return res.status(404).json({ error: 'Competition not found' });
      res.json({ success: true, data: comp });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const comp = await competitionService.create(req.body);
      res.status(201).json({ success: true, data: comp });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const comp = await competitionService.update(req.params.id, req.body);
      if (!comp) return res.status(404).json({ error: 'Competition not found' });
      res.json({ success: true, data: comp });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const deleted = await competitionService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Competition not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

module.exports = new CompetitionController();
