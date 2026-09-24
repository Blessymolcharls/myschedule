import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UserPreference } from '../models/UserPreference.js';
import { StreakRecord } from '../models/StreakRecord.js';
import { Category } from '../models/Category.js';
import { ENV } from '../config/env.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, timezone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      timezone: timezone || 'UTC',
    });

    // Seed default preferences, streak record, and default categories
    await UserPreference.create({ userId: user._id });
    await StreakRecord.create({ userId: user._id });

    const defaultCategories = [
      { name: 'Academics / Work', color: '#3b82f6', icon: 'book', isDefault: true },
      { name: 'Projects & Coding', color: '#8b5cf6', icon: 'code', isDefault: true },
      { name: 'Placement Prep', color: '#10b981', icon: 'briefcase', isDefault: true },
      { name: 'Personal & Health', color: '#f59e0b', icon: 'heart', isDefault: true },
    ];
    await Category.insertMany(defaultCategories.map((c) => ({ ...c, userId: user._id })));

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const preferences = await UserPreference.findOne({ userId: req.user._id });
    const streak = await StreakRecord.findOne({ userId: req.user._id });

    res.json({
      success: true,
      user,
      preferences,
      streak,
    });
  } catch (err) {
    next(err);
  }
};
