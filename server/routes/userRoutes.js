const express = require('express');
const router = express.Router();
const {
  getUserByUsername,
  updateProfile,
  uploadAvatar,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
router.get('/:username', getUserByUsername);

// Protected routes
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/search', protect, searchUsers);

module.exports = router;
