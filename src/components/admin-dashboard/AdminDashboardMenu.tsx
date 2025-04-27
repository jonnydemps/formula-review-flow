
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardMenuProps {
  onSectionChange: (section: 'dashboard' | 'users' | 'formulas' | 'settings') => void;
}

const AdminDashboardMenu: React.FC<AdminDashboardMenuProps> = ({ onSectionChange }) => {
  const handleViewUsers = () => {
    toast.info('Loading users...');
    onSectionChange('users');
  };

  const handleViewFormulas = () => {
    toast.info('Loading formulas...');
    onSectionChange('formulas');
  };

  const handleManageSettings = () => {
    toast.info('Loading settings...');
    onSectionChange('settings');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-ra-blue" />
            Users
          </CardTitle>
          <CardDescription>Manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleViewUsers}>View Users</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-ra-blue" />
            Formulas
          </CardTitle>
          <CardDescription>Review all formulas</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleViewFormulas}>View Formulas</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-ra-blue" />
            Settings
          </CardTitle>
          <CardDescription>Configure system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleManageSettings}>Manage Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardMenu;
