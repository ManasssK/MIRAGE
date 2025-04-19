const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a profile name'],
    trim: true,
    maxlength: [30, 'Profile name cannot be more than 30 characters']
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1/sample/profile'
  },
  bio: {
    type: String,
    maxlength: [150, 'Bio cannot be more than 150 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  interests: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for posts
ProfileSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'profile',
  justOne: false
});

module.exports = mongoose.model('Profile', ProfileSchema);
