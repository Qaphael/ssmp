function errorHandler(err, req, res, _next) {
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' });
  }

  if (err.message?.includes('SASL') || err.message?.includes('password must be a string') || err.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
