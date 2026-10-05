import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secure_question_paper_secret_key_2026_devops');
    const user = await User.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'User identity invalid or not found.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'Account is disabled by System Administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid or expired.' });
  }
};
