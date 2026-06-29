const transferService = require('./transfer.service');

class TransferController {
  async list(req, res, next) {
    try {
      const result = await transferService.list(req.query);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const transfer = await transferService.getById(req.params.id);
      if (!transfer) return res.status(404).json({ error: 'Transfer request not found' });
      res.json({ success: true, data: transfer });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const transfer = await transferService.create(req.body, req.user.id, auditCtx);
      res.status(201).json({ success: true, data: transfer });
    } catch (err) { next(err); }
  }

  async review(req, res, next) {
    try {
      const auditCtx = { userId: req.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const transfer = await transferService.review(
        req.params.id, req.body.status, req.body.rejectionReason, req.user.id, auditCtx
      );
      if (!transfer) return res.status(404).json({ error: 'Transfer request not found' });
      res.json({ success: true, data: transfer });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  }
}

module.exports = new TransferController();
