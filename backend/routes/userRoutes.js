const express = require('express');
const router = express.Router();
const {
  getUserProfile, updateProfile, uploadProfilePicture, uploadCoverImage,
  changePassword, deleteAccount, getUserBlogs, getSuggestedUsers,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadProfile, uploadCover } = require('../config/cloudinary');

router.get('/suggested', protect, getSuggestedUsers);
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:username/blogs', optionalAuth, getUserBlogs);

router.put('/profile', protect, updateProfile);
router.put('/profile/picture', protect, uploadProfile.single('profilePicture'), uploadProfilePicture);
router.put('/profile/cover', protect, uploadCover.single('coverImage'), uploadCoverImage);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
