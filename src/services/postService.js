import axios from 'axios';

// Initialize API URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get feed posts for a profile
export const getFeedByProfile = async (profileId, page = 1, limit = 10) => {
  try {
    const res = await axios.get(
      `${API_URL}/posts/feed/${profileId}?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Get posts by a specific profile
export const getPostsByProfile = async (profileId, page = 1, limit = 10) => {
  try {
    const res = await axios.get(
      `${API_URL}/posts/profile/${profileId}?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Get a single post
export const getPost = async (postId) => {
  try {
    const res = await axios.get(`${API_URL}/posts/${postId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Create a post
export const createPost = async (postData) => {
  try {
    const formData = new FormData();

    // Add post data
    formData.append('caption', postData.caption);
    formData.append('profileId', postData.profileId);

    // Add hashtags if provided
    if (postData.hashtags && postData.hashtags.length > 0) {
      postData.hashtags.forEach(tag => {
        formData.append('hashtags', tag);
      });
    }

    // Add images
    if (postData.images && postData.images.length > 0) {
      for (let i = 0; i < postData.images.length; i++) {
        formData.append('images', postData.images[i]);
      }
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    const res = await axios.post(`${API_URL}/posts`, formData, config);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Update a post
export const updatePost = async (postId, postData) => {
  try {
    const res = await axios.put(`${API_URL}/posts/${postId}`, postData);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const res = await axios.delete(`${API_URL}/posts/${postId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Like/unlike a post
export const likePost = async (postId, profileId) => {
  try {
    const res = await axios.put(`${API_URL}/posts/${postId}/like`, { profileId });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Add comment to a post
export const addComment = async (postId, profileId, text) => {
  try {
    const res = await axios.post(`${API_URL}/posts/${postId}/comment`, {
      profileId,
      text
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Remove comment from a post
export const removeComment = async (postId, commentId) => {
  try {
    const res = await axios.delete(`${API_URL}/posts/${postId}/comment/${commentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
