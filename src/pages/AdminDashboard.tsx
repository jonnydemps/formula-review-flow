
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AdminDashboardHeader from '@/components/admin-dashboard/AdminDashboardHeader';
import AdminDashboardMenu from '@/components/admin-dashboard/AdminDashboardMenu';
import AdminStatusCard from '@/components/admin-dashboard/AdminStatusCard';
import AdminUsersSection from '@/components/admin-dashboard/AdminUsersSection';
import AdminFormulasSection from '@/components/admin-dashboard/AdminFormulasSection';
import AdminSettingsSection from '@/components/admin-dashboard/AdminSettingsSection';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'formulas' | 'settings'>('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AdminDashboardHeader user={user} />

          {activeSection === 'dashboard' && (
            <>
              <AdminDashboardMenu onSectionChange={setActiveSection} />
              <AdminStatusCard />
            </>
          )}

          {activeSection === 'users' && (
            <AdminUsersSection onBack={() => setActiveSection('dashboard')} />
          )}

          {activeSection === 'formulas' && (
            <AdminFormulasSection onBack={() => setActiveSection('dashboard')} />
          )}

          {activeSection === 'settings' && (
            <AdminSettingsSection onBack={() => setActiveSection('dashboard')} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
