const userModel = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    const payload = verifyToken(token);
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
}

module.exports = requireAuth;
