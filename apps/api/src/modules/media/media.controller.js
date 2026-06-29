const mediaService = require('./media.service');

class MediaController {
  async list(req, res, next) {
    try {
      const result = await mediaService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const media = await mediaService.getById(req.params.id);
      if (!media) return res.status(404).json({ error: 'Media not found' });
      res.json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const media = await mediaService.create({
        ...req.body,
        uploadedBy: req.user.id,
      });
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
