const newsService = require('./news.service');

class NewsController {
  async list(req, res, next) {
    try {
      const result = await newsService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const article = await newsService.getById(req.params.id);
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json({ success: true, data: article });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const article = await newsService.create({ ...req.body, authorId: req.user.id });
      res.status(201).json({ success: true, data: article });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
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
