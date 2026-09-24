import { User } from '../models/User.js';
import { UserPreference } from '../models/UserPreference.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { name, timezone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (timezone) user.timezone = timezone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const getPreferences = async (req, res, next) => {
  try {
    let preferences = await UserPreference.findOne({ userId: req.user._id });
    if (!preferences) {
      preferences = await UserPreference.create({ userId: req.user._id });
    }
    res.json({ success: true, preferences });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, preferences });
  } catch (err) {
    next(err);
  }
};
