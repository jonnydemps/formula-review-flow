import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, RefreshCcw, AlertTriangle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import UserDetailsDialog from './users/UserDetailsDialog';

interface Profile {
  id: string;
  name: string | null;
  role: string;
  created_at: string | null;
  email?: string | null;
}

interface AdminUsersSectionProps {
  onBack: () => void;
}

const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // With RLS disabled, try direct approach first, then fallback if needed
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check auth session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }

      // Direct approach now that RLS is disabled
      if (sessionData.session.user.email === 'john-dempsey@hotmail.co.uk') {
        // First try fetching all profiles directly
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching profiles directly:', error);
          throw error;
        }

        // Enrich with email data if possible
        const enrichedProfiles = data.map(profile => ({
          ...profile,
          email: null // We don't have emails in profiles table
        }));

        setProfiles(enrichedProfiles || []);
        setFilteredProfiles(enrichedProfiles || []);
      } else {
        // Non-admin users see only their own profile from the session
        const profile = {
          id: sessionData.session.user.id,
          name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'Unnamed User',
          role: 'customer',
          created_at: sessionData.session.user.created_at,
          email: sessionData.session.user.email
        };
        
        setProfiles([profile]);
        setFilteredProfiles([profile]);
      }
    } catch (error: any) {
      console.error('Failed to load user profiles:', error);
      setError(error.message || 'Failed to load profiles');
      toast.error(`Failed to load user profiles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles based on search term and role
  useEffect(() => {
    let filtered = profiles;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(profile => profile.role === roleFilter);
    }

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, roleFilter]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRefresh = () => {
    fetchProfiles();
    toast.info('Refreshing user list...');
  };

  const handleViewDetails = (user: Profile) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
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

  const uniqueRoles = Array.from(new Set(profiles.map(p => p.role)));

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-ra-blue" />
            User Management
          </CardTitle>
          <CardDescription>View and manage user accounts ({filteredProfiles.length} of {profiles.length} users)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBack}
              >
                Back to Dashboard
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role} className="capitalize">{role}</option>
                  ))}
                </select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
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
            ) : filteredProfiles.length === 0 ? (
              <div className="p-8 text-center border rounded-md">
                <p>{searchTerm || roleFilter !== 'all' ? 'No users match your search criteria.' : 'No user profiles found.'}</p>
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
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{profile.name || 'Unnamed User'}</p>
                            {profile.email && (
                              <p className="text-sm text-gray-500">{profile.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(profile.role)} className="capitalize">
                            {profile.role}
                          </Badge>
                        </TableCell>
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
                            onClick={() => handleViewDetails(profile)}
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

      <UserDetailsDialog
        user={selectedUser}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </>
  );
};

export default AdminUsersSection;
