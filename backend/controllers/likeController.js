const Like = require('../models/Like');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Toggle like
const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existing = await Like.findOne({ user: req.user._id, blog: blog._id });

    if (existing) {
      await existing.deleteOne();
      await Blog.findByIdAndUpdate(blog._id, { $inc: { likesCount: -1 } });
      await User.findByIdAndUpdate(blog.author, { $inc: { totalLikesReceived: -1 } });
      return res.json({ success: true, liked: false, likesCount: blog.likesCount - 1 });
    } else {
      await Like.create({ user: req.user._id, blog: blog._id });
      await Blog.findByIdAndUpdate(blog._id, { $inc: { likesCount: 1 } });
      await User.findByIdAndUpdate(blog.author, { $inc: { totalLikesReceived: 1 } });

      await createNotification({
        recipient: blog.author, sender: req.user._id, type: 'like',
        blog: blog._id, message: `${req.user.name} liked your blog "${blog.title}"`,
      });

      return res.json({ success: true, liked: true, likesCount: blog.likesCount + 1 });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { toggleLike };
