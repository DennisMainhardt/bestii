import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation(); // Get current location

  if (loading) {
    // Optional: Show a loading spinner or component while checking auth state
    return <div className="flex items-center justify-center min-h-screen">Loading auth state...</div>;
  }

  // Check if user exists
  if (!currentUser) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email is verified (important step!)
  // Allow Google users through even if not verified? (Current behavior)
  // If stricter check needed: remove the providerId check
  const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');

  if (!currentUser.emailVerified && !isGoogleUser) {
    // Redirect to login, maybe show a message there indicating verification needed
    return <Navigate to="/login" state={{ from: location, needsVerification: true }} replace />;
  }

  // User is logged in and verified (or Google user), render the child route component
  return <Outlet />; // Renders the nested route (e.g., <Chat />)
};

export default ProtectedRoute; 