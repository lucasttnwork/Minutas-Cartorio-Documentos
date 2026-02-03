// src/pages/MobileSettings.tsx
// Mobile settings page with user preferences and logout

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ui/theme-switcher';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useIsMobile } from '@/hooks/useIsMobile';

type ThemeOption = 'light' | 'dark';

const themeOptions: { value: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
];

export default function MobileSettings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={cn(
      'min-h-screen bg-background',
      isMobile && 'pb-[calc(72px+env(safe-area-inset-bottom,0px))]'
    )}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'sticky top-0 z-40',
          'bg-card/80 backdrop-blur-xl backdrop-saturate-150',
          'border-b border-border/40'
        )}
      >
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className={cn(
              'flex items-center justify-center w-10 h-10 -ml-2 rounded-xl',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-secondary/50',
              'transition-colors duration-200',
              'touch-action-manipulation'
            )}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-foreground">
            Configuracoes
          </h1>
        </div>
      </motion.header>

      {/* Content */}
      <div className="p-4 pb-24 space-y-6">
        {/* User Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={cn(
            'flex items-center gap-4 p-4 rounded-2xl',
            'bg-card border border-border/50'
          )}>
            {/* Avatar */}
            <div className={cn(
              'flex items-center justify-center w-14 h-14 rounded-full',
              'bg-gradient-to-br from-primary/20 to-primary/5',
              'text-primary text-xl font-bold',
              'border-2 border-primary/20'
            )}>
              {userInitial}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground truncate">
                {userName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Preferences Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="px-1 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preferencias
          </h2>

          <div className={cn(
            'rounded-2xl overflow-hidden',
            'bg-card border border-border/50'
          )}>
            {/* Theme Selection */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-xl',
                  'bg-primary/10 text-primary'
                )}>
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Tema</p>
                  <p className="text-xs text-muted-foreground">
                    Escolha a aparencia do app
                  </p>
                </div>
              </div>

              {/* Theme Options */}
              <div className="flex gap-2">
                {themeOptions.map((option) => {
                  const isSelected = theme === option.value;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl',
                        'border-2 transition-all duration-200',
                        'touch-action-manipulation',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        isSelected && 'text-primary'
                      )} />
                      <span className={cn(
                        'text-xs font-medium',
                        isSelected && 'text-primary font-semibold'
                      )}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Account Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="px-1 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conta
          </h2>

          <div className={cn(
            'rounded-2xl overflow-hidden',
            'bg-card border border-border/50'
          )}>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 w-full p-4',
                'text-destructive',
                'hover:bg-destructive/10',
                'transition-colors duration-200',
                'touch-action-manipulation'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl',
                'bg-destructive/10 text-destructive'
              )}>
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Sair da conta</p>
                <p className="text-xs text-destructive/70">
                  Encerrar sessao atual
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/50" />
            </button>
          </div>
        </motion.section>

        {/* App Info */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <p className="text-center text-xs text-muted-foreground/60">
            Sistema de Minutas v1.0
          </p>
          <p className="text-center text-xs text-muted-foreground/40 mt-1">
            Cartorio Pro
          </p>
        </motion.section>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
