const newsService = require('./news.service');
const { pool } = require('../../config/db');

class NewsController {
  async list(req, res, next) {
    try {
      const filters = { ...req.query };
      // Coach sees only their team's news
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        if (teamResult.rows[0]) {
          filters.teamId = teamResult.rows[0].id;
        }
      }
      const result = await newsService.list(filters);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const article = await newsService.getById(req.params.id);
      if (!article) return res.status(404).json({ error: 'Article not found' });
      // Coach can only read their own team's news
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        const teamId = teamResult.rows[0]?.id;
        if (!teamId || article.team_id !== teamId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      res.json({ success: true, data: article });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = { ...req.body, authorId: req.user.id };
      // Coach's news is auto-linked to their team, never auto-published
      if (req.user.role === 'coach') {
        const teamResult = await pool.query(
          'SELECT id FROM teams WHERE coach_id = $1 LIMIT 1',
          [req.user.id]
        );
        if (teamResult.rows[0]) {
          data.teamId = teamResult.rows[0].id;
        }
        data.isPublished = false;
      }
      const article = await newsService.create(data);
      res.status(201).json({ success: true, data: article });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      // Coach can only update their own articles
      if (req.user.role === 'coach') {
        const existing = await newsService.getById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Article not found' });
        if (existing.author_id !== req.user.id) {
          return res.status(403).json({ error: 'You can only edit your own articles' });
        }
        // Coach cannot publish
        delete req.body.isPublished;
        delete req.body.publishedAt;
      }
      const article = await newsService.update(req.params.id, req.body);
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json({ success: true, data: article });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const deleted = await newsService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Article not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

module.exports = new NewsController();
