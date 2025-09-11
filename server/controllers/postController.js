const Post = require('../models/Post');
const Profile = require('../models/Profile');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const cloudinary = require('../config/cloudinary');

// @desc    Get feed posts for a specific profile
// @route   GET /api/posts/feed/:profileId
// @access  Private
exports.getFeedByProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if profile exists and belongs to user
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${profileId}`, 404));
  }

  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this profile', 401));
  }

  let query = {};

  // If it's the default profile, show posts without hashtags and posts with hashtags
  if (profile.isDefault) {
    query = {
      $or: [
        { hashtags: { $size: 0 } },
        { hashtags: { $exists: true } }
      ]
    };
  } else if (profile.interests && profile.interests.length > 0) {
    // For non-default profiles, filter posts by hashtags matching profile interests
    query = {
      hashtags: { $in: profile.interests }
    };
  }

  // Get posts for feed
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate({
      path: 'profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })
    .populate({
      path: 'comments.profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    });

  // Get total count
  const count = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: posts
  });
});

// @desc    Get posts by a specific profile
// @route   GET /api/posts/profile/:profileId
// @access  Private
exports.getPostsByProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if profile exists
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${profileId}`, 404));
  }

  // Get posts by profile
  const posts = await Post.find({ profile: profileId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate({
      path: 'profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    });

  // Get total count
  const count = await Post.countDocuments({ profile: profileId });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: posts
  });
});

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Private
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    })
    .populate({
      path: 'comments.profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    });

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  const { caption, profileId, hashtags } = req.body;

  // Check if profile exists and belongs to user
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${profileId}`, 404));
  }

  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to post from this profile', 401));
  }

  // Check if images were uploaded
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  // Upload images to cloudinary
  const imagePromises = req.files.map(file => {
    return cloudinary.uploader.upload(file.path, {
      folder: 'instagram-clone/posts'
    });
  });

  const imageResults = await Promise.all(imagePromises);

  // Format images for database
  const images = imageResults.map(result => ({
    url: result.secure_url,
    publicId: result.public_id
  }));

  // Parse hashtags from caption if not provided
  let hashtagArray = hashtags || [];
  if (caption) {
    const hashtagsFromCaption = caption.match(/#[a-zA-Z0-9_]+/g);
    if (hashtagsFromCaption) {
      // Remove # symbol and convert to lowercase
      const formattedHashtags = hashtagsFromCaption.map(tag =>
        tag.substring(1).toLowerCase()
      );

      // Combine hashtags from caption with provided hashtags (if any)
      hashtagArray = [...new Set([...hashtagArray, ...formattedHashtags])];
    }
  }

  // Create post
  const post = await Post.create({
    user: req.user.id,
    profile: profileId,
    caption,
    images,
    hashtags: hashtagArray
  });

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  // Check if post belongs to user
  if (post.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this post', 401));
  }

  const { caption, hashtags } = req.body;

  // Parse hashtags from caption if provided
  let hashtagArray = hashtags || post.hashtags;
  if (caption) {
    const hashtagsFromCaption = caption.match(/#[a-zA-Z0-9_]+/g);
    if (hashtagsFromCaption) {
      // Remove # symbol and convert to lowercase
      const formattedHashtags = hashtagsFromCaption.map(tag =>
        tag.substring(1).toLowerCase()
      );

      // Use new hashtags if provided
      hashtagArray = [...new Set([...formattedHashtags])];
    }
  }

  // Update post
  post = await Post.findByIdAndUpdate(
    req.params.id,
    { caption, hashtags: hashtagArray },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  // Check if post belongs to user
  if (post.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this post', 401));
  }

  // Delete images from cloudinary
  if (post.images && post.images.length > 0) {
    const deletePromises = post.images.map(image => {
      if (image.publicId) {
        return cloudinary.uploader.destroy(image.publicId);
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like/unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const { profileId } = req.body;

  // Check if profileId is provided
  if (!profileId) {
    return next(new ErrorResponse('Please provide a profile ID', 400));
  }

  // Check if profile exists and belongs to user
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${profileId}`, 404));
  }

  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to like from this profile', 401));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  // Check if post has already been liked by this profile
  const isLiked = post.likes.some(like => like.toString() === profileId);

  if (isLiked) {
    // Unlike the post
    post.likes = post.likes.filter(like => like.toString() !== profileId);
  } else {
    // Like the post
    post.likes.push(profileId);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const { text, profileId } = req.body;

  // Check if text and profileId are provided
  if (!text || !profileId) {
    return next(new ErrorResponse('Please provide text and profile ID', 400));
  }

  // Check if profile exists and belongs to user
  const profile = await Profile.findById(profileId);
  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${profileId}`, 404));
  }

  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to comment from this profile', 401));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  // Add comment
  post.comments.unshift({
    profile: profileId,
    text
  });

  await post.save();

  // Get updated post with populated comments
  const updatedPost = await Post.findById(req.params.id)
    .populate({
      path: 'comments.profile',
      select: 'name avatar user',
      populate: {
        path: 'user',
        select: 'username'
      }
    });

  res.status(200).json({
    success: true,
    data: updatedPost
  });
});

// @desc    Delete comment from a post
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
exports.removeComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id ${req.params.id}`, 404));
  }

  // Find comment
  const comment = post.comments.find(
    comment => comment._id.toString() === req.params.commentId
  );

  // Check if comment exists
  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id ${req.params.commentId}`, 404));
  }

  // Get profile from comment
  const profile = await Profile.findById(comment.profile);

  // Check if profile belongs to user
  if (!profile || profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  // Remove comment
  post.comments = post.comments.filter(
    comment => comment._id.toString() !== req.params.commentId
  );

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});
