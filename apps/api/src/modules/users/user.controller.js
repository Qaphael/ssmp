const userService = require('./user.service');

class UserController {
  async list(req, res, next) {
    try {
      const result = await userService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req, res, next) {
    try {
      const user = await userService.deactivate(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
