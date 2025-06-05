
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, FileText, Settings, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardMenuProps {
  onSectionChange: (section: 'dashboard' | 'users' | 'formulas' | 'settings') => void;
}

const AdminDashboardMenu: React.FC<AdminDashboardMenuProps> = ({ onSectionChange }) => {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  const handleSectionChange = (section: 'users' | 'formulas' | 'settings', sectionName: string) => {
    setLoadingSection(section);
    toast.info(`Loading ${sectionName.toLowerCase()}...`);
    
    // Add small delay to show loading state
    setTimeout(() => {
      onSectionChange(section);
      setLoadingSection(null);
    }, 300);
  };

  const menuItems = [
    {
      id: 'users' as const,
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: UserCheck,
      action: () => handleSectionChange('users', 'Users'),
    },
    {
      id: 'formulas' as const,
      title: 'Formula Reviews',
      description: 'Review and manage submitted formulas',
      icon: FileText,
      action: () => handleSectionChange('formulas', 'Formulas'),
    },
    {
      id: 'settings' as const,
      title: 'System Settings',
      description: 'Configure application settings',
      icon: Settings,
      action: () => handleSectionChange('settings', 'Settings'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isLoading = loadingSection === item.id;
        
        return (
          <Card 
            key={item.id} 
            className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
            onClick={item.action}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-ra-blue" />
                  {item.title}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-ra-blue transition-colors" />
              </CardTitle>
              <CardDescription className="text-sm">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-ra-blue group-hover:text-white transition-colors"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Manage ${item.title.split(' ')[0]}`
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminDashboardMenu;
