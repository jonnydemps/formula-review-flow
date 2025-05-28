
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Shield, Activity } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  role: string;
  created_at: string | null;
  email?: string | null;
}

interface UserDetailsDialogProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Core user details and account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm">{user.name || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">{user.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{user.email || 'Not available'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Account Activity
              </CardTitle>
              <CardDescription>Account creation and activity information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{formatDate(user.created_at)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>Available administrative actions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  View Activity Log
                </Button>
                <Button variant="outline" size="sm">
                  Reset Password
                </Button>
                {user.role !== 'admin' && (
                  <Button variant="outline" size="sm">
                    Promote to Admin
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
