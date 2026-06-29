const fixtureService = require('./fixture.service');

class FixtureController {
  async list(req, res, next) {
    try {
      const result = await fixtureService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const fixture = await fixtureService.getById(req.params.id);
      if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
      res.json({ success: true, data: fixture });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const fixture = await fixtureService.create(req.body);
      res.status(201).json({ success: true, data: fixture });
    } catch (err) { next(err); }
  }

  async bulkCreate(req, res, next) {
    try {
      const fixtures = await fixtureService.bulkCreate(req.body);
      res.status(201).json({ success: true, data: fixtures, count: fixtures.length });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const fixture = await fixtureService.update(req.params.id, req.body);
      if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
      res.json({ success: true, data: fixture });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const deleted = await fixtureService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Fixture not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  }

  async generateRoundRobin(req, res, next) {
    try {
      const { competitionId, startDate } = req.body;
      const fixtures = await fixtureService.generateRoundRobin(competitionId, startDate);
      res.status(201).json({ success: true, data: fixtures, count: fixtures.length });
    } catch (err) { next(err); }
  }

  async detectConflicts(req, res, next) {
    try {
      const conflicts = await fixtureService.detectConflicts(req.params.competitionId);
      res.json({ success: true, data: conflicts, count: conflicts.length });
    } catch (err) { next(err); }
  }
}

module.exports = new FixtureController();
