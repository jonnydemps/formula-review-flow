
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProfiles(data || []);
      } catch (error: any) {
        toast.error(`Failed to load user profiles: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Dashboard
          </Button>

          {loading ? (
            <div className="p-8 text-center">
              <p>Loading users...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center border rounded-md">
              <p>No user profiles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Joined</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-t">
                      <td className="p-2">{profile.name || 'Unnamed User'}</td>
                      <td className="p-2 capitalize">{profile.role}</td>
                      <td className="p-2">
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString() 
                          : 'Unknown'
                        }
                      </td>
                      <td className="p-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.info("User management functionality coming soon")}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsersSection;
