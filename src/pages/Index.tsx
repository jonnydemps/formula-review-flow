
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Direct session check to avoid using potentially problematic components
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  // Show loading state while checking authentication
  if (isLoading || isCheckingSession) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-ra-blue mb-4" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Once loaded, direct to appropriate route
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/customer-dashboard" replace />;
  }

  // No authenticated user, go to sign-in page instead of home
  return <Navigate to="/sign-in" replace />;
};

export default Index;
