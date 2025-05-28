
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import SystemConfigurationCard from './settings/SystemConfigurationCard';
import SecuritySettingsCard from './settings/SecuritySettingsCard';

interface AdminSettingsSectionProps {
  onBack: () => void;
}

const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-ra-blue" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system-wide settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>

      <SystemConfigurationCard />
      <SecuritySettingsCard />
    </div>
  );
};

export default AdminSettingsSection;
