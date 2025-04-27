
import React from 'react';
import { User } from '@/types/auth';

interface AdminDashboardHeaderProps {
  user: User;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ user }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600 mt-1">
        Welcome back, {user.name || 'Admin'}
      </p>
    </div>
  );
};

export default AdminDashboardHeader;
