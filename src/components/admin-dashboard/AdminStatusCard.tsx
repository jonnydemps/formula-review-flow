
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const AdminStatusCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-ra-blue" />
          System Status
        </CardTitle>
        <CardDescription>Everything is running smoothly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-gray-500">Connected and healthy</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-gray-500">Working correctly</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Storage</p>
              <p className="text-sm text-gray-500">Available (75% free)</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatusCard;
