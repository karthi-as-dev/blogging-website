const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadEditorImage } = require('../config/cloudinary');

// Upload image for blog editor
router.post('/image', protect, uploadEditorImage.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    res.json({ success: true, url: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
