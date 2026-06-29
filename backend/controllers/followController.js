const Follow = require('../models/Follow');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Toggle follow
const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await Follow.findOne({ follower: req.user._id, following: targetId });

    if (existing) {
      await existing.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
      return res.json({ success: true, following: false });
    } else {
      await Follow.create({ follower: req.user._id, following: targetId });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });

      await createNotification({
        recipient: targetId, sender: req.user._id, type: 'follow',
        message: `${req.user.name} started following you`,
      });

      return res.json({ success: true, following: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get followers
const getFollowers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const total = await Follow.countDocuments({ following: user._id });
    const follows = await Follow.find({ following: user._id })
      .populate('follower', 'name username profilePicture profession followersCount')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    const users = follows.map(f => f.follower);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get following
const getFollowing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const total = await Follow.countDocuments({ follower: user._id });
    const follows = await Follow.find({ follower: user._id })
      .populate('following', 'name username profilePicture profession followersCount')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    const users = follows.map(f => f.following);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { toggleFollow, getFollowers, getFollowing };
