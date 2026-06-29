const Blog = require('../models/Blog');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Global search
// @route   GET /api/search?q=query
const globalSearch = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const results = {};

    if (type === 'all' || type === 'blogs') {
      results.blogs = await Blog.find({
        status: 'published',
        $or: [{ title: regex }, { tags: { $in: [regex] } }],
      })
        .populate('author', 'name username profilePicture')
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(10)
        .select('title subtitle slug coverImage author category tags readTime likesCount publishedAt');
    }

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [{ name: regex }, { username: regex }],
        isBlocked: false,
      })
        .select('name username profilePicture profession followersCount')
        .limit(8);
    }

    if (type === 'all' || type === 'categories') {
      results.categories = await Category.find({ name: regex }).limit(5);
    }

    res.json({ success: true, results, query: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search suggestions (autocomplete)
// @route   GET /api/search/suggestions?q=query
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ success: true, suggestions: [] });

    const regex = new RegExp(q.trim(), 'i');

    const [blogs, users] = await Promise.all([
      Blog.find({ status: 'published', title: regex })
        .select('title slug')
        .limit(4),
      User.find({ $or: [{ name: regex }, { username: regex }], isBlocked: false })
        .select('name username profilePicture')
        .limit(3),
    ]);

    const suggestions = [
      ...blogs.map(b => ({ type: 'blog', label: b.title, slug: b.slug })),
      ...users.map(u => ({ type: 'user', label: u.name, username: u.username, profilePicture: u.profilePicture })),
    ];

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { globalSearch, getSearchSuggestions };
