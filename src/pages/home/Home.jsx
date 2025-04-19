import { useState, useEffect, useContext } from 'react';
import ProfileContext from '../../context/ProfileContext';
import { getFeedByProfile } from '../../services/postService';
import Spinner from '../../components/common/Spinner';

const Home = () => {
  const { currentProfile } = useContext(ProfileContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      if (!currentProfile) return;

      try {
        setLoading(true);
        setError(null);
        const res = await getFeedByProfile(currentProfile._id, 1);
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
  }, [currentProfile]);

  const loadMorePosts = async () => {
    if (loading || !hasMore || !currentProfile) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const res = await getFeedByProfile(currentProfile._id, nextPage);
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

  if (!currentProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a profile to view your feed.</p>
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <p className="text-lg font-semibold">
          {currentProfile.name}'s Feed
          {currentProfile.isDefault && <span className="text-sm text-gray-500 ml-2">(Default)</span>}
        </p>
        {currentProfile.interests && currentProfile.interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {currentProfile.interests.map(interest => (
              <span
                key={interest}
                className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
              >
                #{interest}
              </span>
            ))}
          </div>
        )}
      </div>

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
            Your feed is empty. Start by creating a post or follow other profiles to see their content.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow-md">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <img
                  src={post.profile.avatar}
                  alt={post.profile.name}
                  className="h-10 w-10 rounded-full object-cover border border-gray-300 mr-3"
                />
                <div>
                  <p className="font-semibold">{post.profile.name}</p>
                  <p className="text-gray-500 text-xs">{post.profile.user.username}</p>
                </div>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="w-full">
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full h-auto"
                  />
                  {/* TODO: Add carousel for multiple images */}
                </div>
              )}

              {/* Post Content */}
              <div className="p-4">
                {/* Actions */}
                <div className="flex space-x-4 mb-2">
                  <button className="text-gray-700 hover:text-pink-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="text-gray-700 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>

                {/* Likes */}
                <p className="font-semibold text-sm mb-2">
                  {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                </p>

                {/* Caption */}
                {post.caption && (
                  <p className="mb-2">
                    <span className="font-semibold mr-2">{post.profile.user.username}</span>
                    {post.caption}
                  </p>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <p className="text-blue-500 text-sm mb-2">
                    {post.hashtags.map(tag => `#${tag} `)}
                  </p>
                )}

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm mb-1">
                      {post.comments.length > 2
                        ? `View all ${post.comments.length} comments`
                        : ''}
                    </p>
                    {post.comments.slice(0, 2).map(comment => (
                      <p key={comment._id} className="text-sm mb-1">
                        <span className="font-semibold mr-2">
                          {/* Using first name for simplicity */}
                          {comment.profile.name.split(' ')[0]}
                        </span>
                        {comment.text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center my-4">
              <button
                onClick={loadMorePosts}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200"
              >
                {loading ? <Spinner size="small" /> : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
