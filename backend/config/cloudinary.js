const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile picture storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogging/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Cover image storage
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogging/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1500, height: 400, crop: 'fill' }],
  },
});

// Blog cover image storage
const blogCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogging/blog-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  },
});

// General image storage (for editor uploads)
const editorStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogging/editor',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const uploadProfile = multer({ storage: profileStorage });
const uploadCover = multer({ storage: coverStorage });
const uploadBlogCover = multer({ storage: blogCoverStorage });
const uploadEditorImage = multer({ storage: editorStorage });

module.exports = { cloudinary, uploadProfile, uploadCover, uploadBlogCover, uploadEditorImage };
