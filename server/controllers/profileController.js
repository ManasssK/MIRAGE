const Profile = require('../models/Profile');
const User = require('../models/User');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const cloudinary = require('../config/cloudinary');

// @desc    Get all profiles for the logged in user
// @route   GET /api/profiles
// @access  Private
exports.getMyProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
});

// @desc    Get single profile
// @route   GET /api/profiles/:id
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${req.params.id}`, 404));
  }

  // Check if profile belongs to logged in user
  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this profile', 401));
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Create new profile
// @route   POST /api/profiles
// @access  Private
exports.createProfile = asyncHandler(async (req, res, next) => {
  const { name, bio, interests } = req.body;

  // Create profile
  const profile = await Profile.create({
    name,
    bio,
    interests,
    user: req.user.id,
    isDefault: false
  });

  res.status(201).json({
    success: true,
    data: profile
  });
});

// @desc    Update profile
// @route   PUT /api/profiles/:id
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${req.params.id}`, 404));
  }

  // Check if profile belongs to logged in user
  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this profile', 401));
  }

  // Prevent updating isDefault if profile is the default profile
  if (profile.isDefault && req.body.isDefault === false) {
    return next(new ErrorResponse('Cannot change default status of main profile', 400));
  }

  // Update profile
  profile = await Profile.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Delete profile
// @route   DELETE /api/profiles/:id
// @access  Private
exports.deleteProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${req.params.id}`, 404));
  }

  // Check if profile belongs to logged in user
  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this profile', 401));
  }

  // Check if profile is default
  if (profile.isDefault) {
    return next(new ErrorResponse('Cannot delete the default profile', 400));
  }

  await profile.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload profile avatar
// @route   PUT /api/profiles/:id/avatar
// @access  Private
exports.uploadProfileAvatar = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    return next(new ErrorResponse(`Profile not found with id ${req.params.id}`, 404));
  }

  // Check if profile belongs to logged in user
  if (profile.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this profile', 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'instagram-clone/profile-avatars',
      width: 150,
      height: 150,
      crop: 'fill'
    });

    // Update profile avatar
    profile.avatar = result.secure_url;
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return next(new ErrorResponse('Problem with image upload', 500));
  }
});
