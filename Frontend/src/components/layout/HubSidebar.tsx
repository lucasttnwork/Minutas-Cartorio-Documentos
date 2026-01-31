// src/components/layout/HubSidebar.tsx

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/dashboard/minutas',
    label: 'Minutas',
    icon: FileText,
  },
  {
    to: '/dashboard/agentes',
    label: 'Agentes',
    icon: Bot,
  },
];

export function HubSidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 min-h-screen border-r border-border bg-card/50 p-4"
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground px-3">
          Sistema de Minutas
        </h2>
        <p className="text-xs text-muted-foreground px-3 mt-1">
          Selecione uma opção
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-accent/50',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
