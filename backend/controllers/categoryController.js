const Category = require('../models/Category');

// @desc    Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ blogCount: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const category = await Category.create({ name, description, icon, color });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed default categories
const seedCategories = async () => {
  const defaults = [
    { name: 'Technology', icon: '💻', color: '#6366f1' },
    { name: 'Programming', icon: '⌨️', color: '#8b5cf6' },
    { name: 'AI & ML', icon: '🤖', color: '#ec4899' },
    { name: 'Web Development', icon: '🌐', color: '#3b82f6' },
    { name: 'Cyber Security', icon: '🔐', color: '#ef4444' },
    { name: 'Cloud Computing', icon: '☁️', color: '#06b6d4' },
    { name: 'Data Science', icon: '📊', color: '#f59e0b' },
    { name: 'Lifestyle', icon: '🌱', color: '#10b981' },
    { name: 'Travel', icon: '✈️', color: '#f97316' },
    { name: 'Education', icon: '🎓', color: '#84cc16' },
    { name: 'Gaming', icon: '🎮', color: '#a855f7' },
    { name: 'Business', icon: '💼', color: '#64748b' },
  ];

  for (const cat of defaults) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log('✅ Default categories seeded');
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, seedCategories };
