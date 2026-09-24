import { Category } from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({
      userId: req.user._id,
      name,
      color: color || '#6366f1',
      icon: icon || 'folder',
    });
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
