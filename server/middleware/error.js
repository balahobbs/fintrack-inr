export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.code === 11000) return res.status(409).json({ message: 'That record already exists' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? 'Something went wrong on our side' : err.message,
  });
}
