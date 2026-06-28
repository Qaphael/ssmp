function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
