const organizationService = require('./organization.service');

class OrganizationController {
  async list(req, res, next) {
    try {
      const result = await organizationService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const org = await organizationService.getById(req.params.id);
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      res.json({ success: true, data: org });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const org = await organizationService.create(req.body, {
        userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'],
      });
      res.status(201).json({ success: true, data: org });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const org = await organizationService.update(req.params.id, req.body, {
        userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'],
      });
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      res.json({ success: true, data: org });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const deleted = await organizationService.delete(req.params.id, {
        userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'],
      });
      if (!deleted) return res.status(404).json({ error: 'Organization not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

module.exports = new OrganizationController();
