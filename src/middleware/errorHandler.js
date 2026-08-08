function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }

  if (error.code === 'P2003') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
