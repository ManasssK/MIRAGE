const User = require('../models/User');
const Profile = require('../models/Profile');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');
const { sendTokenResponse } = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return next(new ErrorResponse('Username already taken', 400));
  }

  // Create user
  const user = await User.create({
    fullName,
    username,
    email,
    password
  });

  // Create default profile for user
  const defaultProfile = await Profile.create({
    user: user._id,
    name: 'Main Profile',
    isDefault: true
  });

  // Return token
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Return token
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'profiles',
    select: 'name avatar isDefault'
  });

  res.status(200).json({
    success: true,
    data: user
  });
});
