import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import Spinner from '../../components/common/Spinner';

const ProfileSelect = () => {
  const { user } = useContext(AuthContext);
  const {
    profiles,
    switchProfile,
    createProfile,
    deleteProfile,
    loading
  } = useContext(ProfileContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    bio: '',
    interests: []
  });
  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleProfileSelect = (profileId) => {
    switchProfile(profileId);
    navigate('/');
  };

  const handleCreateToggle = () => {
    setShowCreateForm(!showCreateForm);
    setNewProfile({
      name: '',
      bio: '',
      interests: []
    });
    setInterestInput('');
    setErrors({});
  };

  const handleCreateChange = (e) => {
    setNewProfile({
      ...newProfile,
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

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      // Remove # if user added it
      const formattedInterest = interestInput.trim().replace(/^#/, '').toLowerCase();

      if (!newProfile.interests.includes(formattedInterest)) {
        setNewProfile({
          ...newProfile,
          interests: [...newProfile.interests, formattedInterest]
        });
      }

      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setNewProfile({
      ...newProfile,
      interests: newProfile.interests.filter(i => i !== interest)
    });
  };

  const handleInterestKeyDown = (e) => {
    // Add interest when Enter or comma is pressed
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const validateProfile = () => {
    let tempErrors = {};
    let isValid = true;

    if (!newProfile.name.trim()) {
      tempErrors.name = 'Profile name is required';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (validateProfile()) {
      setSubmitting(true);

      try {
        const createdProfile = await createProfile(newProfile);
        setShowCreateForm(false);
        handleProfileSelect(createdProfile._id);
      } catch (err) {
        console.error('Error creating profile:', err);
        setErrors({
          submit: err.message || 'Failed to create profile. Please try again.'
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        await deleteProfile(profileId);
      } catch (err) {
        console.error('Error deleting profile:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.fullName}!</h1>
              <p className="text-gray-600">Choose a profile to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {profiles.map(profile => (
                <div
                  key={profile._id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition duration-200"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-16 w-16 rounded-full object-cover mr-4 border border-gray-300"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {profile.name}
                        {profile.isDefault && (
                          <span className="ml-2 text-xs text-gray-500 font-normal">(Default)</span>
                        )}
                      </h2>
                      {profile.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">{profile.bio}</p>
                      )}
                    </div>
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.map(interest => (
                          <span
                            key={interest}
                            className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                          >
                            #{interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleProfileSelect(profile._id)}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                      Select
                    </button>

                    {!profile.isDefault && (
                      <button
                        onClick={() => handleDeleteProfile(profile._id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-md transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Create New Profile Button */}
              <div
                className="bg-gray-50 rounded-lg border border-gray-200 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition duration-200"
                onClick={handleCreateToggle}
              >
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-pink-500 font-medium">Create New Profile</p>
              </div>
            </div>
          </div>

          {/* Create Profile Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Profile</h2>
                <button
                  onClick={handleCreateToggle}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {errors.submit && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Profile Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newProfile.name}
                    onChange={handleCreateChange}
                    className={`w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                    placeholder="e.g., Photography, Gaming, Travel"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
                    Bio (optional)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={newProfile.bio}
                    onChange={handleCreateChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Tell us a bit about this profile..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Interests / Hashtags (optional)
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

                  {newProfile.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newProfile.interests.map(interest => (
                        <span
                          key={interest}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          #{interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
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

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleCreateToggle}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md mr-2 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="small" />
                        <span className="ml-2">Creating...</span>
                      </>
                    ) : (
                      'Create Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
