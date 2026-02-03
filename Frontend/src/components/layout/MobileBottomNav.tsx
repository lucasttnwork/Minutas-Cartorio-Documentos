// src/components/layout/MobileBottomNav.tsx
// Tab bar inferior iOS-style com Liquid Glass effect

import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from './HubSidebar';

export function MobileBottomNav() {
  const location = useLocation();

  // Encontra o índice do item ativo para a animação
  // Inclui a página de settings como possível item ativo
  const isSettingsActive = location.pathname === '/settings';
  const activeIndex = isSettingsActive
    ? -1 // Settings não está em navItems, então -1
    : navItems.findIndex(
        (item) =>
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + '/')
      );

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
              // Previne delay de navegação em mobile
              onClick={(e) => {
                // Força navegação imediata
                e.currentTarget.blur();
              }}
            >
              {/* Liquid Glass Bubble - Animated indicator */}
              {isActive && (
                <motion.div
                  layoutId="liquid-glass-bubble"
                  className="liquid-glass-indicator"
                  // Animação não bloqueia interação
                  style={{ pointerEvents: 'none' }}
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

        {/* Settings Link */}
        <NavLink
          to="/settings"
          className={cn(
            'mobile-tab-item',
            isSettingsActive && 'active'
          )}
          onClick={(e) => {
            e.currentTarget.blur();
          }}
        >
          {/* Liquid Glass Bubble for Settings */}
          {isSettingsActive && (
            <motion.div
              layoutId="liquid-glass-bubble"
              className="liquid-glass-indicator"
              style={{ pointerEvents: 'none' }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 32,
              }}
            />
          )}

          <Settings
            className={cn(
              'mobile-tab-icon',
              isSettingsActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'mobile-tab-label',
              isSettingsActive ? 'text-primary font-semibold' : 'text-muted-foreground'
            )}
          >
            Ajustes
          </span>
        </NavLink>
      </div>
    </nav>
  );
}
