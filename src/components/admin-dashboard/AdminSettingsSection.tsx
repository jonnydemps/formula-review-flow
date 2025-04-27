
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettingsSectionProps {
  onBack: () => void;
}

const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({ onBack }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-ra-blue" />
          System Settings
        </CardTitle>
        <CardDescription>Configure system settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Dashboard
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Email Notifications</h3>
              <p className="text-sm text-gray-500 mb-4">Configure email notifications for system events</p>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Settings functionality coming soon")}
              >
                Configure
              </Button>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium mb-2">API Keys</h3>
              <p className="text-sm text-gray-500 mb-4">Manage API keys for external integrations</p>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Settings functionality coming soon")}
              >
                Manage Keys
              </Button>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium mb-2">Quote Templates</h3>
              <p className="text-sm text-gray-500 mb-4">Customize quote templates and pricing</p>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Settings functionality coming soon")}
              >
                Edit Templates
              </Button>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-medium mb-2">System Logs</h3>
              <p className="text-sm text-gray-500 mb-4">View system activity and error logs</p>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Settings functionality coming soon")}
              >
                View Logs
              </Button>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsSection;
