const mediaService = require('./media.service');
const { pool } = require('../../config/db');

class MediaController {
  async list(req, res, next) {
    try {
      const filters = { ...req.query };
      // Coach sees only their team's media
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        if (teamResult.rows[0]) {
          filters.teamId = teamResult.rows[0].id;
        }
      }
      const result = await mediaService.list(filters);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const media = await mediaService.getById(req.params.id);
      if (!media) return res.status(404).json({ error: 'Media not found' });
      // Coach can only read their own team's media
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        const teamId = teamResult.rows[0]?.id;
        if (!teamId || media.team_id !== teamId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      res.json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const data = { ...req.body, uploadedBy: req.user.id };
      // Coach's media is auto-linked to their team
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        if (teamResult.rows[0]) {
          data.teamId = teamResult.rows[0].id;
        }
      }
      const media = await mediaService.create(data);
      res.status(201).json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }

  async approve(req, res, next) {
    try {
      const media = await mediaService.approve(req.params.id, req.user.id);
      if (!media) return res.status(404).json({ error: 'Media not found' });
      res.json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }

  async reject(req, res, next) {
    try {
      const deleted = await mediaService.reject(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Media not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await mediaService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Media not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MediaController();
