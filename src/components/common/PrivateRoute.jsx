import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { currentProfile, loading: profileLoading } = useContext(ProfileContext);
  const location = useLocation();

  // If auth is loading, show spinner
  if (authLoading) {
    return <Spinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but profile not selected yet, redirect to profile select
  // Skip for the profile select page itself
  if (!currentProfile && !profileLoading && location.pathname !== '/profile-select') {
    return <Navigate to="/profile-select" replace />;
  }

  // If all checks pass, render the children
  return children;
};

export default PrivateRoute;
