const express = require('express');
const router = express.Router();
const {
  getFeedByProfile,
  getPostsByProfile,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  removeComment
} = require('../controllers/postController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All routes are protected
router.use(protect);

// Feed and profile posts
router.get('/feed/:profileId', getFeedByProfile);
router.get('/profile/:profileId', getPostsByProfile);

// CRUD operations for posts
router.route('/')
  .post(upload.array('images', 10), createPost);

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

// Like/unlike posts
router.put('/:id/like', likePost);

// Comment on posts
router.post('/:id/comment', addComment);
router.delete('/:id/comment/:commentId', removeComment);

module.exports = router;
