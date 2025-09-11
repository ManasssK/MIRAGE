import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/home/Home';
import ProfileSelect from './pages/profile/ProfileSelect';
import ProfilePage from './pages/profile/ProfilePage';
import CreatePost from './pages/home/CreatePost';
import PostDetail from './pages/home/PostDetail';
import Explore from './pages/explore/Explore';
import Settings from './pages/settings/Settings';
import NotFound from './pages/common/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile-select" element={
                <PrivateRoute>
                  <ProfileSelect />
                </PrivateRoute>
              } />

              {/* Main App Routes with Navbar */}
              <Route path="/" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <Home />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              <Route path="/create" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <CreatePost />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              <Route path="/post/:id" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <PostDetail />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              <Route path="/profile/:id" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <ProfilePage />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              <Route path="/explore" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <Explore />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <div className="flex-grow container mx-auto px-4 py-6">
                      <Settings />
                    </div>
                  </div>
                </PrivateRoute>
              } />

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
