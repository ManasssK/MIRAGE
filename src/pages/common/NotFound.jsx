import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-700">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md font-medium transition duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
