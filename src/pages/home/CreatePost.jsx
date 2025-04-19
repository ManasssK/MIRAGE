import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileContext from '../../context/ProfileContext';
import { createPost } from '../../services/postService';
import Spinner from '../../components/common/Spinner';

const CreatePost = () => {
  const { currentProfile } = useContext(ProfileContext);
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Limit to 10 images
      const selectedFiles = filesArray.slice(0, 10);

      setImages(selectedFiles);

      // Generate previews
      const previewsArray = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreview(previewsArray);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]); // Clean up
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      // Remove # if user added it
      const formattedHashtag = hashtagInput.trim().replace(/^#/, '').toLowerCase();

      if (!hashtags.includes(formattedHashtag)) {
        setHashtags([...hashtags, formattedHashtag]);
      }

      setHashtagInput('');
    }
  };

  const handleHashtagKeyDown = (e) => {
    // Add hashtag when Enter or comma is pressed
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const extractHashtagsFromCaption = (text) => {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.match(hashtagRegex);

    if (matches) {
      // Remove # symbol and convert to lowercase
      return matches.map(tag => tag.substring(1).toLowerCase());
    }

    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    if (!currentProfile) {
      setError('No profile selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Extract hashtags from caption
      const captionHashtags = extractHashtagsFromCaption(caption);

      // Combine with manually added hashtags (avoiding duplicates)
      const allHashtags = [...new Set([...hashtags, ...captionHashtags])];

      const postData = {
        caption,
        profileId: currentProfile._id,
        hashtags: allHashtags,
        images
      };

      await createPost(postData);

      // Clean up image previews
      imagePreview.forEach(preview => URL.revokeObjectURL(preview));

      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  if (!currentProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a profile to create a post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Selection */}
          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-2">Posting as:</p>
            <div className="flex items-center">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="h-10 w-10 rounded-full object-cover border border-gray-300 mr-3"
              />
              <div>
                <p className="font-semibold">{currentProfile.name}</p>
                {currentProfile.isDefault && (
                  <p className="text-gray-500 text-xs">Default Profile</p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Images (up to 10)
            </label>

            {imagePreview.length === 0 ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-center">
                  Click to select images<br />
                  <span className="text-gray-500 text-sm">or drag and drop them here</span>
                </p>
              </div>
            ) : (
              <div className="mb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {imagePreview.length < 10 && (
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-gray-500 text-sm mt-1">Add More</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label htmlFor="caption" className="block text-gray-700 font-medium mb-2">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Write a caption... Use #hashtags in your caption to categorize your post"
            />
          </div>

          {/* Hashtags */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Additional Hashtags
            </label>
            <div className="flex">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-gray-400">#</span>
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Add hashtags (e.g., photography, travel)"
                />
              </div>
              <button
                type="button"
                onClick={handleAddHashtag}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-r-md transition duration-200"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or comma to add multiple hashtags
            </p>

            {hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
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
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md mr-2 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <Spinner size="small" />
                  <span className="ml-2">Posting...</span>
                </>
              ) : (
                'Share Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
