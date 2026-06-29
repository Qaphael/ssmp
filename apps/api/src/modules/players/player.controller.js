const playerService = require('./player.service');

class PlayerController {
  async list(req, res, next) {
    try {
      const result = await playerService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const player = await playerService.getById(req.params.id);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const player = await playerService.create(req.body, auditCtx);
      res.status(201).json({ success: true, data: player });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }

  async createBulk(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const players = await playerService.createBulk(req.params.teamId, req.body.players, auditCtx);
      res.status(201).json({ success: true, data: players });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const player = await playerService.update(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role,
        auditCtx
      );
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }

  async updateInjuryStatus(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const player = await playerService.updateInjuryStatus(req.params.id, req.body, auditCtx);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (err) {
      next(err);
    }
  }

  async clearInjury(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const player = await playerService.clearInjury(req.params.id, auditCtx);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const deleted = await playerService.delete(req.params.id, auditCtx);
      if (!deleted) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PlayerController();
