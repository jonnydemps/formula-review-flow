
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SecuritySettingsCard: React.FC = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: '90',
    loginAttempts: '5',
    sessionSecurity: true,
    auditLogging: true
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const apiKey = 'sk-1234567890abcdef';

  const handleSave = () => {
    toast.success('Security settings updated successfully');
    console.log('Saving security settings:', settings);
  };

  const handleRegenerateApiKey = () => {
    toast.success('API key regenerated successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-ra-blue" />
          Security Settings
        </CardTitle>
        <CardDescription>Configure security policies and authentication settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
            <Input
              id="passwordExpiry"
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => setSettings({...settings, passwordExpiry: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loginAttempts">Max Login Attempts</Label>
            <Input
              id="loginAttempts"
              type="number"
              value={settings.loginAttempts}
              onChange={(e) => setSettings({...settings, loginAttempts: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enhanced Session Security</Label>
              <p className="text-sm text-gray-500">Enable secure session management</p>
            </div>
            <Switch
              checked={settings.sessionSecurity}
              onCheckedChange={(checked) => setSettings({...settings, sessionSecurity: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Logging</Label>
              <p className="text-sm text-gray-500">Log all administrative actions</p>
            </div>
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(checked) => setSettings({...settings, auditLogging: checked})}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>API Key Management</Label>
            <div className="flex items-center gap-2">
              <Input
                value={showApiKey ? apiKey : '••••••••••••••••'}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateApiKey}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsCard;
