
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import AdminDashboardHeader from '@/components/admin-dashboard/AdminDashboardHeader';
import AdminDashboardMenu from '@/components/admin-dashboard/AdminDashboardMenu';
import AdminStatusCard from '@/components/admin-dashboard/AdminStatusCard';
import AdminUsersSection from '@/components/admin-dashboard/AdminUsersSection';
import AdminFormulasSection from '@/components/admin-dashboard/AdminFormulasSection';
import AdminSettingsSection from '@/components/admin-dashboard/AdminSettingsSection';

const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'formulas' | 'settings'>('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('No authenticated user, redirecting to sign-in');
        navigate('/sign-in');
      } else if (user.role !== 'admin') {
        console.log('User is not admin, redirecting to customer dashboard');
        setError('Access denied. Admin privileges required.');
        setTimeout(() => navigate('/customer-dashboard'), 2000);
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-500 text-lg">Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if access denied
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Redirect if no user or not admin (fallback)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <AdminDashboardHeader user={user} />

          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <AdminDashboardMenu onSectionChange={setActiveSection} />
              <AdminStatusCard />
            </div>
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
