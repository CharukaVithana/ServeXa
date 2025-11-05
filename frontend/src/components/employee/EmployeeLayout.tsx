import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileHeader from './Header';
import StatusCards from './cards';
import NavigationTabs from './Navigation';

const EmployeeLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Sticky */}
      <div className="sticky top-0 z-50 shadow-md">
        <ProfileHeader />
      </div>

      {/* Main Content Container */}
      <div className="w-full">
        {/* Status Cards Section */}
        <div className="py-6">
          <StatusCards />
        </div>

        {/* Navigation Tabs Section */}
        <div className="bg-white shadow-sm">
          <NavigationTabs />
        </div>

        {/* Dynamic Content Section - This changes based on active tab */}
        <div className="py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
