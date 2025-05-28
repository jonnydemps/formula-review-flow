
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

const SystemConfigurationCard: React.FC = () => {
  const [config, setConfig] = useState({
    siteName: 'RA Formula Analysis',
    maintenanceMode: false,
    emailNotifications: true,
    autoQuoteGeneration: false,
    maxFileSize: '10',
    sessionTimeout: '24'
  });

  const handleSave = () => {
    toast.success('System configuration saved successfully');
    console.log('Saving configuration:', config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-ra-blue" />
          System Configuration
        </CardTitle>
        <CardDescription>Configure core system settings and behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={config.siteName}
              onChange={(e) => setConfig({...config, siteName: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => setConfig({...config, sessionTimeout: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={config.maxFileSize}
              onChange={(e) => setConfig({...config, maxFileSize: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable public access</p>
            </div>
            <Switch
              checked={config.maintenanceMode}
              onCheckedChange={(checked) => setConfig({...config, maintenanceMode: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Send system notifications via email</p>
            </div>
            <Switch
              checked={config.emailNotifications}
              onCheckedChange={(checked) => setConfig({...config, emailNotifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Quote Generation</Label>
              <p className="text-sm text-gray-500">Automatically generate quotes for new formulas</p>
            </div>
            <Switch
              checked={config.autoQuoteGeneration}
              onCheckedChange={(checked) => setConfig({...config, autoQuoteGeneration: checked})}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemConfigurationCard;
