// src/pages/DashboardHub.tsx

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { HubSidebar, PageTransition } from '@/components/layout';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

export default function DashboardHub() {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Redirect /dashboard to /dashboard/minutas
  if (location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/minutas" replace />;
  }

  return (
    <div className={cn(
      'flex min-h-screen',
      isMobile && 'max-w-full overflow-x-hidden'
    )}>
      {/* Desktop: Sidebar */}
      {!isMobile && <HubSidebar />}

      {/* Main content - isolado da toolbar */}
      <main
        className={cn(
          'flex-1 min-h-screen w-full',
          isMobile && 'pb-[calc(84px+env(safe-area-inset-bottom,0))] max-w-full overflow-x-hidden'
        )}
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Mobile: Bottom Tab Bar - completamente independente */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
