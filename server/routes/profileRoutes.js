const express = require('express');
const router = express.Router();
const {
  getMyProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadProfileAvatar
} = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getMyProfiles)
  .post(createProfile);

router.route('/:id')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

router.put('/:id/avatar', upload.single('avatar'), uploadProfileAvatar);

module.exports = router;
