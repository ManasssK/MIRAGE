import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileContext from '../../context/ProfileContext';
import { getPostsByProfile } from '../../services/postService';
import Spinner from '../../components/common/Spinner';

const ProfilePage = () => {
  const { id } = useParams();
  const { profiles, currentProfile } = useContext(ProfileContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // Load profile
  useEffect(() => {
    const loadProfile = () => {
      if (!id) return;

      const foundProfile = profiles.find(p => p._id === id);
      if (foundProfile) {
        setProfile(foundProfile);
      } else {
        setError('Profile not found');
      }
    };

    loadProfile();
  }, [id, profiles]);

  // Load profile posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        setError(null);
        const res = await getPostsByProfile(profile._id, 1);
        setPosts(res.data);
        setHasMore(res.currentPage < res.totalPages);
        setPage(1);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [profile]);

  const loadMorePosts = async () => {
    if (loading || !hasMore || !profile) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const res = await getPostsByProfile(profile._id, nextPage);
      setPosts([...posts, ...res.data]);
      setHasMore(res.currentPage < res.totalPages);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Failed to load more posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="md:flex items-center">
          <div className="mb-4 md:mb-0 md:mr-6 flex justify-center">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-24 w-24 md:h-36 md:w-36 rounded-full object-cover border border-gray-300"
            />
          </div>
          <div className="flex-1">
            <div className="md:flex items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 md:mb-0 md:mr-4">
                {profile.name}
                {profile.isDefault && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">(Default)</span>
                )}
              </h1>

              {/* Edit Button (if current profile) */}
              {currentProfile?._id === profile._id && (
                <button
                  onClick={() => navigate('/settings')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm transition duration-200 mt-2 md:mt-0"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <div>
                  <span className="font-semibold">{posts.length}</span> posts
                </div>
                <div>
                  <span className="font-semibold">{profile.followers?.length || 0}</span> followers
                </div>
                <div>
                  <span className="font-semibold">{profile.following?.length || 0}</span> following
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-2 whitespace-pre-line">{profile.bio}</p>
              )}
            </div>

            {/* Interests/Hashtags */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span
                    key={interest}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center my-12">
            <Spinner size="large" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-6">
              This profile hasn't shared any posts yet.
            </p>

            {currentProfile?._id === profile._id && (
              <button
                onClick={() => navigate('/create')}
                className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.map(post => (
                <div
                  key={post._id}
                  className="aspect-square cursor-pointer relative group"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0].url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex items-center text-white space-x-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>{post.likes.length}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span>{post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMorePosts}
                  disabled={loading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {loading ? <Spinner size="small" /> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
