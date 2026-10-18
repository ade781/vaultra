function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  // Prisma specific error codes
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return res.status(409).json({
      error: `Conflict: Data with this value already exists${target}.`,
      details: err.meta,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found: The requested record does not exist.',
      details: err.meta,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
