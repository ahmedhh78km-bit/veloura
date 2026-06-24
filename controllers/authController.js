import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate Token Utility
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      res.status(400);
      return next(new Error('Please provide both username and password'));
    }

    if (global.isMockDB) {
      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        return res.json({
          _id: 'mock_admin_id',
          username: process.env.ADMIN_USERNAME,
          role: 'admin',
          token: generateToken('mock_admin_id'),
        });
      } else {
        res.status(401);
        return next(new Error('Invalid username or password (Mock Mode)'));
      }
    }

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error('Invalid username or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check token validity
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
};
