const notificationDbService = require('./notification-db.service');

class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationDbService.listByUser(req.user.id, req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const updated = await notificationDbService.markAsRead(req.user.id, req.body.ids);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async subscribe(req, res, next) {
    try {
      const sub = await notificationDbService.savePushSubscription(
        req.user.id,
        req.body.subscription,
        req.headers['user-agent']
      );
      res.status(201).json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  async unsubscribe(req, res, next) {
    try {
      await notificationDbService.removePushSubscription(req.user.id, req.body.endpoint);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async registerDeviceToken(req, res, next) {
    try {
      const token = await notificationDbService.saveDeviceToken(
        req.user.id,
        req.body.token,
        req.body.platform
      );
      res.status(201).json({ success: true, data: token });
    } catch (err) {
      next(err);
    }
  }

  async removeDeviceToken(req, res, next) {
    try {
      await notificationDbService.removeDeviceToken(req.user.id, req.body.token);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
