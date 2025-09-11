import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

// Create context
const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize API URL from environment variable or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load profiles
  const loadProfiles = async () => {
    if (!isAuthenticated) {
      setProfiles([]);
      setCurrentProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/profiles`);
      setProfiles(res.data.data);

      // Get currently selected profile or default to first profile
      const savedProfileId = localStorage.getItem('currentProfileId');

      if (savedProfileId) {
        const savedProfile = res.data.data.find(
          profile => profile._id === savedProfileId
        );

        if (savedProfile) {
          setCurrentProfile(savedProfile);
        } else {
          // If saved profile not found, use default profile
          const defaultProfile = res.data.data.find(profile => profile.isDefault);
          setCurrentProfile(defaultProfile || res.data.data[0]);
          localStorage.setItem('currentProfileId', defaultProfile?._id || res.data.data[0]?._id);
        }
      } else {
        // If no saved profile, use default profile
        const defaultProfile = res.data.data.find(profile => profile.isDefault);
        setCurrentProfile(defaultProfile || res.data.data[0]);
        localStorage.setItem('currentProfileId', defaultProfile?._id || res.data.data[0]?._id);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Failed to load profiles. Please try again.'
      );
      console.error('Load profiles error:', err);
    }
  };

  // Set current profile
  const switchProfile = (profileId) => {
    const profile = profiles.find(p => p._id === profileId);

    if (profile) {
      setCurrentProfile(profile);
      localStorage.setItem('currentProfileId', profileId);
    }
  };

  // Create new profile
  const createProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/profiles`, profileData);

      // Add new profile to profiles list
      setProfiles([...profiles, res.data.data]);

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Failed to create profile. Please try again.'
      );
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (profileId, profileData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.put(`${API_URL}/profiles/${profileId}`, profileData);

      // Update profiles list
      setProfiles(
        profiles.map(profile =>
          profile._id === profileId ? res.data.data : profile
        )
      );

      // Update current profile if needed
      if (currentProfile?._id === profileId) {
        setCurrentProfile(res.data.data);
      }

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
      throw err;
    }
  };

  // Delete profile
  const deleteProfile = async (profileId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/profiles/${profileId}`);

      // Remove from profiles list
      const updatedProfiles = profiles.filter(profile => profile._id !== profileId);
      setProfiles(updatedProfiles);

      // If deleted profile is current, switch to default
      if (currentProfile?._id === profileId) {
        const defaultProfile = updatedProfiles.find(profile => profile.isDefault);
        setCurrentProfile(defaultProfile || updatedProfiles[0]);
        localStorage.setItem('currentProfileId', defaultProfile?._id || updatedProfiles[0]?._id);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Failed to delete profile. Please try again.'
      );
      throw err;
    }
  };

  // Upload profile avatar
  const uploadProfileAvatar = async (profileId, formData) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const res = await axios.put(
        `${API_URL}/profiles/${profileId}/avatar`,
        formData,
        config
      );

      // Update profiles list
      setProfiles(
        profiles.map(profile =>
          profile._id === profileId ? res.data.data : profile
        )
      );

      // Update current profile if needed
      if (currentProfile?._id === profileId) {
        setCurrentProfile(res.data.data);
      }

      setLoading(false);
      return res.data.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        'Failed to upload avatar. Please try again.'
      );
      throw err;
    }
  };

  // Load profiles when user changes
  useEffect(() => {
    if (user) {
      loadProfiles();
    } else {
      setProfiles([]);
      setCurrentProfile(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        loading,
        error,
        loadProfiles,
        switchProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        uploadProfileAvatar
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
