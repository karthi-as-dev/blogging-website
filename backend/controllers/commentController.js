const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Add comment
const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const comment = await Comment.create({
      blog: blog._id, author: req.user._id, content,
      parentComment: parentComment || null,
    });

    await Blog.findByIdAndUpdate(blog._id, { $inc: { commentsCount: 1 } });

    const populated = await comment.populate('author', 'name username profilePicture');

    // Notify blog author
    if (!parentComment) {
      await createNotification({
        recipient: blog.author, sender: req.user._id, type: 'comment',
        blog: blog._id, comment: comment._id,
        message: `${req.user.name} commented on your blog "${blog.title}"`,
      });
    } else {
      // Notify parent comment author
      const parent = await Comment.findById(parentComment);
      if (parent) {
        await createNotification({
          recipient: parent.author, sender: req.user._id, type: 'reply',
          blog: blog._id, comment: comment._id,
          message: `${req.user.name} replied to your comment`,
        });
      }
    }

    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get comments for blog
const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Top-level comments only
    const comments = await Comment.find({ blog: req.params.blogId, parentComment: null })
      .populate('author', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    // For each comment, get replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name username profilePicture')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    const total = await Comment.countDocuments({ blog: req.params.blogId, parentComment: null });
    res.json({ success: true, comments: commentsWithReplies, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit comment
const editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Delete replies too
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addComment, getComments, editComment, deleteComment };
