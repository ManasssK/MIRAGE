const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const cloudinary = require('../config/cloudinary');

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserByUsername = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-password')
    .populate({
      path: 'profiles',
      select: 'name avatar isDefault'
    });

  if (!user) {
    return next(new ErrorResponse(`User not found with username ${req.params.username}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, username, bio, website } = req.body;

  // If username is being updated, check if it already exists
  if (username && username !== req.user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new ErrorResponse('Username already taken', 400));
    }
  }

  // Build update object
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (username) updateFields.username = username;
  if (bio !== undefined) updateFields.bio = bio; // Allow empty bio
  if (website !== undefined) updateFields.website = website;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Upload user avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'instagram-clone/avatars',
      width: 150,
      height: 150,
      crop: 'fill'
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return next(new ErrorResponse('Problem with image upload', 500));
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } }
    ]
  }).select('username fullName avatar');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});
