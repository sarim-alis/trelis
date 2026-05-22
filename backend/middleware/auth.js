import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token', expired: true });
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};
