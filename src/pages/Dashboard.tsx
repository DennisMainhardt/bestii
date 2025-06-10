import React from 'react';
import DashboardNav from '@/components/dashboard/DashboardNav';
import ProfileSection from '@/components/dashboard/ProfileSection';
import SubscriptionSection from '@/components/dashboard/SubscriptionSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row flex-grow mt-16">
        <DashboardNav activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow mt-8 md:mt-0 md:ml-8">
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'subscription' && <SubscriptionSection />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 