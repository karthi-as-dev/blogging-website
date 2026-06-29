const express = require('express');
const router = express.Router();
const { toggleLike } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:blogId', protect, toggleLike);

module.exports = router;
