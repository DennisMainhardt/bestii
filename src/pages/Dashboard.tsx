import React from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import ProfileSection from '@/components/dashboard/ProfileSection';
import SubscriptionSection from '@/components/dashboard/SubscriptionSection';
import Header from '@/components/Header'; // Assuming you have a global Header
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [activeSection, setActiveSection] = React.useState<'profile' | 'subscription'>('profile');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hideNav={true} />
      <div className="container mx-auto px-4 py-8 flex flex-grow mt-16">
        <DashboardNav activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow ml-8">
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'subscription' && <SubscriptionSection />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 