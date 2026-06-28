const teamService = require('./team.service');

class TeamController {
  async list(req, res, next) {
    try {
      const result = await teamService.list(req.query, req.user.id, req.user.role);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const team = await teamService.getById(req.params.id);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const team = await teamService.create(req.body);
      res.status(201).json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const team = await teamService.update(req.params.id, req.body);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async assignCoach(req, res, next) {
    try {
      const team = await teamService.assignCoach(req.params.id, req.body.coachId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async approveRegistration(req, res, next) {
    try {
      const team = await teamService.approveRegistration(req.params.id, req.body.status);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async approveRoster(req, res, next) {
    try {
      const team = await teamService.approveRoster(req.params.id, req.body.status);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await teamService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TeamController();
