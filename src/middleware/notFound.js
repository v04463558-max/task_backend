function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl || req.url,
    hint: "Try GET / or GET /api/health",
  });
}

module.exports = notFound;
