
// No authentication or guards; show dashboard main entry
import React from 'react';
import AdminDashboard from './AdminDashboard';
import ModeratorDashboard from './ModeratorDashboard';
import UserDashboard from './UserDashboard';

const Dashboard: React.FC = () => {
  // Show all dashboards, or just one (example: Admin)
  return <AdminDashboard />;
};

export default Dashboard;
