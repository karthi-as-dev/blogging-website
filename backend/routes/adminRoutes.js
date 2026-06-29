const express = require('express');
const router = express.Router();
const { getSiteStats, getAllUsers, toggleBlockUser, deleteUser, getAllBlogs, adminDeleteBlog, toggleFeatured } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/stats', getSiteStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/blogs', getAllBlogs);
router.delete('/blogs/:id', adminDeleteBlog);
router.put('/blogs/:id/feature', toggleFeatured);

module.exports = router;
