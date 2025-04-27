
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Settings, UserCheck, FileText, Bell } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.name || 'Admin'}
            </p>
          </div>

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
                <Button variant="outline" className="w-full">View Users</Button>
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
                <Button variant="outline" className="w-full">View Formulas</Button>
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
                <Button variant="outline" className="w-full">Manage Settings</Button>
              </CardContent>
            </Card>
          </div>

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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
