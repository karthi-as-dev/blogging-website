const Blog = require('../models/Blog');
const User = require('../models/User');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Follow = require('../models/Follow');
const { createNotification } = require('../utils/notificationHelper');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create blog
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, subtitle, content, category, tags, status } = req.body;
    const coverImage = req.file ? req.file.path : req.body.coverImage || '';

    const blog = await Blog.create({
      title, subtitle, content,
      ...(category && category !== '' && { category }),
      coverImage,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      status: status || 'draft',
      author: req.user._id,
    });

    // Update user post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPosts: 1 } });

    // Notify followers if published
    if (blog.status === 'published') {
      const followers = await Follow.find({ following: req.user._id });
      for (const f of followers) {
        await createNotification({
          recipient: f.follower, sender: req.user._id, type: 'new_post',
          blog: blog._id, message: `${req.user.name} published a new blog: "${blog.title}"`,
        });
      }
    }

    const populated = await blog.populate([
      { path: 'author', select: 'name username profilePicture' },
      { path: 'category', select: 'name slug color' },
    ]);

    res.status(201).json({ success: true, message: 'Blog created successfully', blog: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all published blogs (feed/explore)
// @route   GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, tag, sort = 'latest' } = req.query;

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const sortMap = {
      latest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      popular: { views: -1 },
      trending: { likesCount: -1 },
    };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name username profilePicture')
      .populate('category', 'name slug color icon')
      .sort(sortMap[sort] || { publishedAt: -1 })
      .skip(skip).limit(limit)
      .select('-content');

    res.json({ success: true, blogs, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personalized feed
// @route   GET /api/blogs/feed
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followingIds = (await Follow.find({ follower: req.user._id })).map(f => f.following);

    // Prioritize followed authors, then trending
    const feedBlogs = await Blog.find({
      status: 'published',
      $or: [
        { author: { $in: followingIds } },
        { likesCount: { $gte: 5 } },
      ],
    })
      .populate('author', 'name username profilePicture')
      .populate('category', 'name slug color icon')
      .sort({ publishedAt: -1 })
      .skip(skip).limit(limit)
      .select('-content');

    res.json({ success: true, blogs: feedBlogs, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name username profilePicture bio profession followersCount')
      .populate('category', 'name slug color icon');

    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    // Increment views
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });

    let isLiked = false;
    let isBookmarked = false;
    let isFollowingAuthor = false;

    if (req.user) {
      isLiked = !!(await Like.findOne({ user: req.user._id, blog: blog._id }));
      isBookmarked = !!(await Bookmark.findOne({ user: req.user._id, blog: blog._id }));
      isFollowingAuthor = !!(await Follow.findOne({ follower: req.user._id, following: blog.author._id }));
    }

    res.json({ success: true, blog: { ...blog.toObject(), isLiked, isBookmarked, isFollowingAuthor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blog by ID (for editing)
// @route   GET /api/blogs/edit/:id
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name username profilePicture')
      .populate('category', 'name slug');

    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const wasPublished = blog.status === 'published';
    const { title, subtitle, content, category, tags, status } = req.body;
    if (title) blog.title = title;
    if (subtitle !== undefined) blog.subtitle = subtitle;
    if (content) blog.content = content;
    if (category && category !== '') blog.category = category;
    else if (category === '') blog.category = undefined;
    if (tags) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (status) blog.status = status;
    if (req.file) blog.coverImage = req.file.path;

    await blog.save();

    // Notify followers if just published
    if (!wasPublished && blog.status === 'published') {
      const followers = await Follow.find({ following: req.user._id });
      for (const f of followers) {
        await createNotification({
          recipient: f.follower, sender: req.user._id, type: 'new_post',
          blog: blog._id, message: `${req.user.name} published a new blog: "${blog.title}"`,
        });
      }
    }

    const populated = await blog.populate([
      { path: 'author', select: 'name username profilePicture' },
      { path: 'category', select: 'name slug color' },
    ]);

    res.json({ success: true, message: 'Blog updated', blog: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete cover image from cloudinary
    if (blog.coverImage && blog.coverImage.includes('cloudinary')) {
      const parts = blog.coverImage.split('/');
      const publicId = `blogging/blog-covers/${parts[parts.length - 1].split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await blog.deleteOne();
    await User.findByIdAndUpdate(blog.author, { $inc: { totalPosts: -1 } });

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
const getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name username profilePicture')
      .populate('category', 'name slug color')
      .sort({ likesCount: -1, views: -1 })
      .limit(8)
      .select('-content');
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published', featured: true })
      .populate('author', 'name username profilePicture')
      .populate('category', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('-content');
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/blogs/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, published, drafts, allBlogs] = await Promise.all([
      Blog.countDocuments({ author: userId }),
      Blog.countDocuments({ author: userId, status: 'published' }),
      Blog.countDocuments({ author: userId, status: 'draft' }),
      Blog.find({ author: userId }).sort({ createdAt: -1 }).limit(5).populate('category', 'name slug'),
    ]);

    const likeAgg = await Blog.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' }, totalViews: { $sum: '$views' }, totalComments: { $sum: '$commentsCount' } } },
    ]);

    const stats = likeAgg[0] || { totalLikes: 0, totalViews: 0, totalComments: 0 };
    const user = await require('../models/User').findById(userId).select('followersCount followingCount');

    res.json({
      success: true,
      stats: {
        totalBlogs: total, published, drafts,
        followers: user.followersCount, following: user.followingCount,
        totalLikes: stats.totalLikes, totalViews: stats.totalViews, totalComments: stats.totalComments,
      },
      recentBlogs: allBlogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBlog, getBlogs, getFeed, getBlogBySlug, getBlogById,
  updateBlog, deleteBlog, getTrendingBlogs, getFeaturedBlogs, getDashboardStats,
};
