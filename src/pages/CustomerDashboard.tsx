
import React from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadSection from '@/components/customer-dashboard/UploadSection';
import CustomerDashboardHeader from '@/components/customer-dashboard/CustomerDashboardHeader';
import CustomerDashboardTabs from '@/components/customer-dashboard/CustomerDashboardTabs';
import { useCustomerDashboard } from '@/hooks/useCustomerDashboard';

const CustomerDashboard: React.FC = () => {
  const {
    user,
    authLoading,
    formulas,
    formulasLoading,
    isUploading,
    showUploader,
    setShowUploader,
    handleFileUpload,
    handleAcceptQuote,
    handleRefresh
  } = useCustomerDashboard();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if no user (should be handled by the hook, but this is a fallback)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <CustomerDashboardHeader onRefresh={handleRefresh} />
            
            <UploadSection 
              showUploader={showUploader}
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
              onCancel={() => setShowUploader(false)}
              onShowUploader={() => setShowUploader(true)}
            />
            
            <CustomerDashboardTabs
              formulas={formulas}
              formulasLoading={formulasLoading}
              onAcceptQuote={handleAcceptQuote}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
