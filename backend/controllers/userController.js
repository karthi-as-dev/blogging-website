const User = require('../models/User');
const Blog = require('../models/Blog');
const Follow = require('../models/Follow');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get user profile by username
// @route   GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let isFollowing = false;
    if (req.user) {
      isFollowing = !!(await Follow.findOne({ follower: req.user._id, following: user._id }));
    }

    res.json({ success: true, user: { ...user.toObject(), isFollowing } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profession, skills, location, website, socialLinks } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profession !== undefined) user.profession = profession;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (socialLinks) user.socialLinks = { ...user.socialLinks.toObject(), ...socialLinks };

    await user.save();
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/profile/picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const user = await User.findById(req.user._id);

    // Delete old image from cloudinary
    if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blogging/profiles/${publicId}`).catch(() => {});
    }

    user.profilePicture = req.file.path;
    await user.save();
    res.json({ success: true, message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload cover image
// @route   PUT /api/users/profile/cover
const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const user = await User.findById(req.user._id);
    user.coverImage = req.file.path;
    await user.save();
    res.json({ success: true, message: 'Cover image updated', coverImage: user.coverImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ success: false, message: 'Google accounts cannot change password this way' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's blogs
// @route   GET /api/users/:username/blogs
const getUserBlogs = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const isOwner = req.user && req.user._id.toString() === user._id.toString();
    const filter = { author: user._id, ...(isOwner ? {} : { status: 'published' }) };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    res.json({ success: true, blogs, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggested
const getSuggestedUsers = async (req, res) => {
  try {
    const followingIds = req.user
      ? (await Follow.find({ follower: req.user._id })).map(f => f.following)
      : [];

    const users = await User.find({
      _id: { $nin: [...followingIds, req.user?._id].filter(Boolean) },
      role: 'user',
    })
      .select('name username profilePicture profession followersCount')
      .sort({ followersCount: -1 })
      .limit(6);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile, updateProfile, uploadProfilePicture, uploadCoverImage,
  changePassword, deleteAccount, getUserBlogs, getSuggestedUsers,
};
