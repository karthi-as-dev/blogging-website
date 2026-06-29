const Bookmark = require('../models/Bookmark');
const Blog = require('../models/Blog');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Toggle bookmark
const toggleBookmark = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const existing = await Bookmark.findOne({ user: req.user._id, blog: blog._id });

    if (existing) {
      await existing.deleteOne();
      await Blog.findByIdAndUpdate(blog._id, { $inc: { bookmarksCount: -1 } });
      return res.json({ success: true, bookmarked: false });
    } else {
      await Bookmark.create({ user: req.user._id, blog: blog._id });
      await Blog.findByIdAndUpdate(blog._id, { $inc: { bookmarksCount: 1 } });

      await createNotification({
        recipient: blog.author, sender: req.user._id, type: 'bookmark',
        blog: blog._id, message: `${req.user.name} bookmarked your blog "${blog.title}"`,
      });

      return res.json({ success: true, bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user bookmarks
const getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Bookmark.countDocuments({ user: req.user._id });
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'blog',
        populate: [
          { path: 'author', select: 'name username profilePicture' },
          { path: 'category', select: 'name slug color' },
        ],
        select: '-content',
      })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    const blogs = bookmarks.map(b => b.blog).filter(Boolean);
    res.json({ success: true, blogs, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { toggleBookmark, getBookmarks };
