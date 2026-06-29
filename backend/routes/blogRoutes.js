const express = require('express');
const router = express.Router();
const {
  createBlog, getBlogs, getFeed, getBlogBySlug, getBlogById,
  updateBlog, deleteBlog, getTrendingBlogs, getFeaturedBlogs, getDashboardStats,
} = require('../controllers/blogController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadBlogCover } = require('../config/cloudinary');

router.get('/trending', getTrendingBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/feed', protect, getFeed);
router.get('/dashboard', protect, getDashboardStats);
router.get('/edit/:id', protect, getBlogById);
router.get('/', optionalAuth, getBlogs);
router.get('/:slug', optionalAuth, getBlogBySlug);

router.post('/', protect, uploadBlogCover.single('coverImage'), createBlog);
router.put('/:id', protect, uploadBlogCover.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
