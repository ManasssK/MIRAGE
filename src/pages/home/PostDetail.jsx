import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProfileContext from '../../context/ProfileContext';
import { getPost, likePost, addComment, removeComment } from '../../services/postService';
import Spinner from '../../components/common/Spinner';

const PostDetail = () => {
  const { id } = useParams();
  const { currentProfile } = useContext(ProfileContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const res = await getPost(id);
        setPost(res.data);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post. It may have been deleted or is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleLike = async () => {
    if (!currentProfile || !post) return;

    try {
      const res = await likePost(post._id, currentProfile._id);
      setPost(res.data);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim() || !currentProfile || !post) return;

    try {
      setSubmitting(true);
      const res = await addComment(post._id, currentProfile._id, comment);
      setPost(res.data);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentProfile || !post) return;

    try {
      const res = await removeComment(post._id, commentId);
      setPost(res.data);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Post not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200"
        >
          Go Home
        </button>
      </div>
    );
  }

  const isLiked = post.likes.includes(currentProfile?._id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Post Image Section */}
          <div className="md:w-1/2 bg-black flex items-center justify-center">
            {post.images && post.images.length > 0 && (
              <img
                src={post.images[0].url}
                alt="Post"
                className="w-full h-auto"
              />
            )}
          </div>

          {/* Post Details Section */}
          <div className="md:w-1/2 flex flex-col">
            {/* Post Header */}
            <div className="p-4 border-b border-gray-200 flex items-center">
              <Link to={`/profile/${post.profile._id}`} className="flex items-center">
                <img
                  src={post.profile.avatar}
                  alt={post.profile.name}
                  className="h-10 w-10 rounded-full object-cover border border-gray-300 mr-3"
                />
                <div>
                  <p className="font-semibold">{post.profile.name}</p>
                  <p className="text-gray-500 text-xs">{post.profile.user.username}</p>
                </div>
              </Link>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {/* Caption */}
              {post.caption && (
                <div className="flex mb-4 pb-3 border-b border-gray-100">
                  <Link to={`/profile/${post.profile._id}`} className="mr-3">
                    <img
                      src={post.profile.avatar}
                      alt={post.profile.name}
                      className="h-8 w-8 rounded-full object-cover border border-gray-300"
                    />
                  </Link>
                  <div>
                    <p>
                      <Link to={`/profile/${post.profile._id}`} className="font-semibold mr-2">
                        {post.profile.user.username}
                      </Link>
                      {post.caption}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <p className="text-blue-500 text-sm mt-1">
                        {post.hashtags.map(tag => `#${tag} `)}
                      </p>
                    )}

                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map(comment => (
                    <div key={comment._id} className="flex group">
                      <Link to={`/profile/${comment.profile._id}`} className="mr-3">
                        <img
                          src={comment.profile.avatar}
                          alt={comment.profile.name}
                          className="h-8 w-8 rounded-full object-cover border border-gray-300"
                        />
                      </Link>
                      <div className="flex-1">
                        <p>
                          <Link to={`/profile/${comment.profile._id}`} className="font-semibold mr-2">
                            {comment.profile.user.username}
                          </Link>
                          {comment.text}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Delete Button (if comment is by current profile) */}
                      {currentProfile?._id === comment.profile._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-4 mb-3">
                <button
                  onClick={handleLike}
                  className={`${isLiked ? 'text-pink-500' : 'text-gray-700 hover:text-pink-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="text-gray-700 hover:text-gray-900" onClick={() => document.getElementById('comment-input').focus()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>

              {/* Likes Count */}
              <p className="font-semibold text-sm mb-3">
                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
              </p>

              {/* Add Comment Form */}
              {currentProfile && (
                <form onSubmit={handleCommentSubmit} className="flex">
                  <input
                    id="comment-input"
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border-0 focus:ring-0 bg-gray-50 rounded-l-md px-3 py-2"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    className={`px-4 py-2 rounded-r-md ${
                      !comment.trim() || submitting
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {submitting ? <Spinner size="small" /> : 'Post'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
