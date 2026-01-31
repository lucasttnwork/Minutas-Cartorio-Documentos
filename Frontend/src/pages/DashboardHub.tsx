// src/pages/DashboardHub.tsx

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { HubSidebar } from '@/components/layout';

export default function DashboardHub() {
  const location = useLocation();

  // Redirect /dashboard to /dashboard/minutas
  if (location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/minutas" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <HubSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
