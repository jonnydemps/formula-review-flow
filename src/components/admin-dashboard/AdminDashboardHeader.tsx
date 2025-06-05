
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Shield } from 'lucide-react';
import { User as UserType } from '@/types/auth';

interface AdminDashboardHeaderProps {
  user: UserType;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ user }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Administrator
            </Badge>
          </div>
          <div className="space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Welcome back, {user.name || user.email}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {getCurrentTime()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
