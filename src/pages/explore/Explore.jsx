import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileContext from '../../context/ProfileContext';
import Spinner from '../../components/common/Spinner';

const Explore = () => {
  const { currentProfile } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // This is a placeholder. In a real app, we would fetch and display posts
  // from across the platform that match the current profile's interests.
  const placeholderPosts = [
    {
      id: 1,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=1',
      likes: 120,
      comments: 14
    },
    {
      id: 2,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=2',
      likes: 85,
      comments: 7
    },
    {
      id: 3,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=3',
      likes: 241,
      comments: 32
    },
    {
      id: 4,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=4',
      likes: 56,
      comments: 3
    },
    {
      id: 5,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=5',
      likes: 192,
      comments: 21
    },
    {
      id: 6,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=6',
      likes: 78,
      comments: 9
    },
    {
      id: 7,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=7',
      likes: 135,
      comments: 15
    },
    {
      id: 8,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=8',
      likes: 64,
      comments: 5
    },
    {
      id: 9,
      imageUrl: 'https://source.unsplash.com/random/300x300?sig=9',
      likes: 112,
      comments: 18
    }
  ];

  if (!currentProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a profile to explore content.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-gray-600">
          Discover new content that matches your {currentProfile.name} profile's interests
        </p>

        {currentProfile.interests && currentProfile.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentProfile.interests.map(interest => (
              <span
                key={interest}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-300"
              >
                #{interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts, hashtags, or users..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {placeholderPosts.map(post => (
          <div
            key={post.id}
            className="aspect-square cursor-pointer relative group"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 flex items-center text-white space-x-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
