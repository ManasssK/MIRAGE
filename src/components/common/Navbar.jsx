import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { profiles, currentProfile, switchProfile } = useContext(ProfileContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileSelect = (profileId) => {
    switchProfile(profileId);
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-pink-500">
          MIRAGE
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          <Link to="/explore" className="text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link to="/create" className="text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center focus:outline-none"
            >
              {currentProfile ? (
                <div className="flex items-center">
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="h-8 w-8 rounded-full object-cover border border-gray-300"
                  />
                  <span className="ml-2 font-medium text-sm hidden md:block">{currentProfile.name}</span>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>

                {/* Profile Switcher */}
                <div className="py-1 border-b border-gray-200">
                  <div className="px-4 py-1 text-xs text-gray-500 uppercase">Switch Profile</div>
                  {profiles.map(profile => (
                    <button
                      key={profile._id}
                      onClick={() => handleProfileSelect(profile._id)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentProfile?._id === profile._id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      } flex items-center`}
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-6 w-6 rounded-full object-cover mr-2"
                      />
                      <span>{profile.name}</span>
                      {profile.isDefault && (
                        <span className="ml-1 text-xs text-gray-500">(Default)</span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/profile-select')}
                    className="w-full text-left px-4 py-2 text-sm text-pink-500 hover:bg-gray-100"
                  >
                    Manage Profiles
                  </button>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
