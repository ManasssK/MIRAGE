import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import Spinner from '../../components/common/Spinner';

const Settings = () => {
  const { user, updateProfile, uploadAvatar, logout, loading: authLoading } = useContext(AuthContext);
  const { currentProfile, updateProfile: updateUserProfile, uploadProfileAvatar, loading: profileLoading } = useContext(ProfileContext);

  const [activeTab, setActiveTab] = useState('account');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || ''
  });

  const [profileForm, setProfileForm] = useState({
    name: currentProfile?.name || '',
    bio: currentProfile?.bio || '',
    interests: currentProfile?.interests || []
  });

  const [interestInput, setInterestInput] = useState('');
  const accountAvatarRef = useRef(null);
  const profileAvatarRef = useRef(null);
  const navigate = useNavigate();

  // Handle account form changes
  const handleAccountChange = (e) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value
    });

    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });

    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Handle interest actions
  const handleAddInterest = () => {
    if (interestInput.trim()) {
      // Remove # if user added it
      const formattedInterest = interestInput.trim().replace(/^#/, '').toLowerCase();

      if (!profileForm.interests.includes(formattedInterest)) {
        setProfileForm({
          ...profileForm,
          interests: [...profileForm.interests, formattedInterest]
        });
      }

      setInterestInput('');
    }
  };

  const handleInterestKeyDown = (e) => {
    // Add interest when Enter or comma is pressed
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const removeInterest = (interest) => {
    setProfileForm({
      ...profileForm,
      interests: profileForm.interests.filter(i => i !== interest)
    });
  };

  // Handle avatar uploads
  const handleAccountAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        await uploadAvatar(formData);
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setErrors({
          ...errors,
          accountAvatar: 'Failed to upload avatar. Please try again.'
        });
      }
    }
  };

  const handleProfileAvatarChange = async (e) => {
    if (!currentProfile) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        await uploadProfileAvatar(currentProfile._id, formData);
      } catch (err) {
        console.error('Error uploading profile avatar:', err);
        setErrors({
          ...errors,
          profileAvatar: 'Failed to upload avatar. Please try again.'
        });
      }
    }
  };

  // Validate forms
  const validateAccountForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!accountForm.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!accountForm.username.trim()) {
      tempErrors.username = 'Username is required';
      isValid = false;
    } else if (accountForm.username.length < 3) {
      tempErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    setErrors({...errors, ...tempErrors});
    return isValid;
  };

  const validateProfileForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!profileForm.name.trim()) {
      tempErrors.name = 'Profile name is required';
      isValid = false;
    }

    setErrors({...errors, ...tempErrors});
    return isValid;
  };

  // Handle form submissions
  const handleAccountSubmit = async (e) => {
    e.preventDefault();

    if (validateAccountForm()) {
      setSubmitting(true);

      try {
        await updateProfile(accountForm);
        setErrors({
          ...errors,
          account: null,
          accountSuccess: 'Account updated successfully!'
        });
      } catch (err) {
        setErrors({
          ...errors,
          account: err.message || 'Failed to update account. Please try again.'
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!currentProfile) return;

    if (validateProfileForm()) {
      setSubmitting(true);

      try {
        await updateUserProfile(currentProfile._id, profileForm);
        setErrors({
          ...errors,
          profile: null,
          profileSuccess: 'Profile updated successfully!'
        });
      } catch (err) {
        setErrors({
          ...errors,
          profile: err.message || 'Failed to update profile. Please try again.'
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="large" />
      </div>
    );
  }

  if (!user || !currentProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">User or profile not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Tabs */}
          <div className="md:w-1/4 bg-gray-50 md:min-h-[600px]">
            <div className="p-4 md:p-6 md:border-r border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 hidden md:block">Settings</h2>

              <div className="flex md:block space-x-4 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`px-4 md:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'account'
                      ? 'bg-pink-100 text-pink-700 md:w-full'
                      : 'text-gray-700 hover:bg-gray-100 md:w-full'
                  }`}
                >
                  Account Settings
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 md:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'bg-pink-100 text-pink-700 md:w-full'
                      : 'text-gray-700 hover:bg-gray-100 md:w-full'
                  }`}
                >
                  Profile Settings
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 md:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'security'
                      ? 'bg-pink-100 text-pink-700 md:w-full'
                      : 'text-gray-700 hover:bg-gray-100 md:w-full'
                  }`}
                >
                  Security
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-3/4 p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h3>

                {errors.account && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errors.account}
                  </div>
                )}

                {errors.accountSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {errors.accountSuccess}
                  </div>
                )}

                <form onSubmit={handleAccountSubmit}>
                  {/* Avatar */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="h-20 w-20 rounded-full object-cover border border-gray-300 mr-4"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => accountAvatarRef.current.click()}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-200"
                        >
                          Change Photo
                        </button>
                        <input
                          type="file"
                          ref={accountAvatarRef}
                          onChange={handleAccountAvatarChange}
                          className="hidden"
                          accept="image/*"
                        />
                        {errors.accountAvatar && (
                          <p className="text-red-500 text-sm mt-1">{errors.accountAvatar}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={accountForm.fullName}
                      onChange={handleAccountChange}
                      className={`w-full px-3 py-2 border ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={accountForm.username}
                      onChange={handleAccountChange}
                      className={`w-full px-3 py-2 border ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={accountForm.bio}
                      onChange={handleAccountChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  {/* Website */}
                  <div className="mb-6">
                    <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={accountForm.website}
                      onChange={handleAccountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
                    >
                      {submitting ? <Spinner size="small" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Profile Settings
                  {currentProfile.isDefault && (
                    <span className="ml-2 text-sm text-gray-500 font-normal">(Default Profile)</span>
                  )}
                </h3>

                {errors.profile && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errors.profile}
                  </div>
                )}

                {errors.profileSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {errors.profileSuccess}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  {/* Avatar */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Profile Picture</label>
                    <div className="flex items-center">
                      <img
                        src={currentProfile.avatar}
                        alt={currentProfile.name}
                        className="h-20 w-20 rounded-full object-cover border border-gray-300 mr-4"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => profileAvatarRef.current.click()}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-200"
                        >
                          Change Photo
                        </button>
                        <input
                          type="file"
                          ref={profileAvatarRef}
                          onChange={handleProfileAvatarChange}
                          className="hidden"
                          accept="image/*"
                        />
                        {errors.profileAvatar && (
                          <p className="text-red-500 text-sm mt-1">{errors.profileAvatar}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={`w-full px-3 py-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <label htmlFor="profileBio" className="block text-gray-700 font-medium mb-2">
                      Profile Bio
                    </label>
                    <textarea
                      id="profileBio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  {/* Interests */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Interests / Hashtags
                    </label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-400">#</span>
                        <input
                          type="text"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyDown={handleInterestKeyDown}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                          placeholder="Add interests (e.g., photography, travel)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddInterest}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-r-md transition duration-200"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Press Enter or comma to add multiple interests
                    </p>

                    {profileForm.interests.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profileForm.interests.map(interest => (
                          <span
                            key={interest}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            #{interest}
                            <button
                              type="button"
                              onClick={() => removeInterest(interest)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
                    >
                      {submitting ? <Spinner size="small" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Account Email</h4>
                    <p className="text-gray-600">{user.email}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Password</h4>
                    <p className="text-gray-600 mb-3">••••••••</p>
                    <button
                      type="button"
                      className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>

                    <button
                      onClick={handleLogout}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-200 mr-3"
                    >
                      Sign Out
                    </button>

                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
