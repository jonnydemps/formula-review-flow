
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, RefreshCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Profile {
  id: string;
  name: string | null;
  role: string;
  created_at: string | null;
}

interface AdminUsersSectionProps {
  onBack: () => void;
}

const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback method to check if user is admin directly
  const fetchProfilesDirectly = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user?.email) {
        throw new Error('Authentication required');
      }
      
      // For simplicity, just check if the current user's email matches admin email
      // This is a temporary solution until RLS policies are fixed
      if (sessionData.session.user.email === 'john-dempsey@hotmail.co.uk') {
        // Admin user - fetch all users from auth schema
        const { data: adminData } = await supabase.auth.admin.listUsers();
        
        if (adminData?.users) {
          // Map auth users to simplified profile format
          const mappedProfiles = adminData.users.map(user => ({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unnamed User',
            role: user.user_metadata?.role || 'customer',
            created_at: user.created_at
          }));
          
          setProfiles(mappedProfiles);
        } else {
          setProfiles([]);
        }
      } else {
        // Non-admin users see only their own profile
        setProfiles([{
          id: sessionData.session.user.id,
          name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'Unnamed User',
          role: sessionData.session.user.user_metadata?.role || 'customer',
          created_at: sessionData.session.user.created_at
        }]);
      }
    } catch (error: any) {
      console.error('Failed to load user profiles directly:', error);
      setError(error.message || 'Failed to load profiles');
      toast.error(`Failed to load user profiles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check auth session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }
      
      // Try using RLS policies first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        // If RLS policy fails, fall back to direct method
        await fetchProfilesDirectly();
        return;
      }

      setProfiles(data || []);
    } catch (error: any) {
      console.error('Failed to load user profiles:', error);
      // Fall back to direct method on any error
      await fetchProfilesDirectly();
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRefresh = () => {
    fetchProfiles();
    toast.info('Refreshing user list...');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-ra-blue" />
          User Management
        </CardTitle>
        <CardDescription>View and manage user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onBack}
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <p>Loading users...</p>
            </div>
          ) : profiles.length === 0 && !error ? (
            <div className="p-8 text-center border rounded-md">
              <p>No user profiles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.name || 'Unnamed User'}</TableCell>
                      <TableCell className="capitalize">{profile.role}</TableCell>
                      <TableCell>
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString() 
                          : 'Unknown'
                        }
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.info("User management functionality coming soon")}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsersSection;
