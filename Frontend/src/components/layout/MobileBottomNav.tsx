// src/components/layout/MobileBottomNav.tsx
// Tab bar inferior iOS-style com Liquid Glass effect

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from './HubSidebar';
import { useAuth } from '@/contexts/AuthContext';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Encontra o índice do item ativo para a animação
  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + '/')
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="mobile-tab-bar">
      <div className="mobile-tab-bar-content">
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'mobile-tab-item',
                isActive && 'active'
              )}
            >
              {/* Liquid Glass Bubble - Animated indicator */}
              {isActive && (
                <motion.div
                  layoutId="liquid-glass-bubble"
                  className="liquid-glass-indicator"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                  }}
                />
              )}

              {/* Icon */}
              <item.icon
                className={cn(
                  'mobile-tab-icon',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  'mobile-tab-label',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mobile-tab-item mobile-tab-logout"
          aria-label="Sair"
        >
          <LogOut className="mobile-tab-icon text-muted-foreground" />
          <span className="mobile-tab-label text-muted-foreground">Sair</span>
        </button>
      </div>
    </nav>
  );
}
