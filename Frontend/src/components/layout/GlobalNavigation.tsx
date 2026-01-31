// src/components/layout/GlobalNavigation.tsx
// Premium global navigation with glassmorphism and theme switcher
// Inspired by Apple, Vercel, and Linear design patterns

import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, X, FileText, Sparkles, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeSwitcherCompact } from "@/components/ui/theme-switcher";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
];

export function GlobalNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Navigation - Premium Glassmorphism */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16",
          // Premium Glassmorphism effect
          "bg-card/75 backdrop-blur-2xl backdrop-saturate-180",
          // Subtle border
          "border-b border-border/40",
          // Multi-layer shadow for depth
          "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]"
        )}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 group",
              "transition-opacity duration-200 hover:opacity-80"
            )}
          >
            {/* Logo Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl",
                "bg-gradient-to-br from-primary to-primary/80",
                "shadow-sm shadow-primary/20",
                "transition-transform duration-200 group-hover:scale-105"
              )}
            >
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground tracking-tight">
                Sistema de Minutas
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Cartorio Pro
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>

                  {/* Active indicator - Animated pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={cn(
                        "absolute inset-0 rounded-lg -z-10",
                        "bg-secondary/80 border border-border/50"
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme Switcher & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Action Button - Example */}
            <Link
              to="/minuta/nova"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-primary text-primary-foreground",
                "text-sm font-medium",
                "shadow-sm shadow-primary/20",
                "transition-all duration-200",
                "hover:shadow-md hover:shadow-primary/30 hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nova Minuta</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-border/50" />

            {/* Theme Switcher */}
            <ThemeSwitcherCompact />

            {/* User info and Logout - Only show when authenticated */}
            {isAuthenticated && (
              <>
                {/* Divider */}
                <div className="w-px h-6 bg-border/50" />

                {/* User display */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">
                    {profile?.nome || user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    "text-sm font-medium text-muted-foreground",
                    "transition-all duration-200",
                    "hover:bg-destructive/10 hover:text-destructive",
                    "active:scale-[0.98]"
                  )}
                  title="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden fixed top-4 right-4 z-50",
          "flex items-center justify-center w-11 h-11",
          "bg-card/85 backdrop-blur-xl backdrop-saturate-150",
          "border border-border/40 rounded-xl",
          "shadow-lg shadow-black/10",
          "transition-all duration-200",
          isOpen && "bg-secondary/90"
        )}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? "close" : "open"}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Mobile Logo (visible when menu is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Link to="/dashboard" className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  "bg-gradient-to-br from-primary to-primary/80",
                  "shadow-md shadow-primary/20"
                )}
              >
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-background/50 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className={cn(
                "lg:hidden fixed top-0 right-0 bottom-0 w-72 z-40",
                "bg-card/90 backdrop-blur-2xl backdrop-saturate-150",
                "border-l border-border/40",
                "shadow-2xl shadow-black/20"
              )}
            >
              <div className="flex flex-col h-full p-6 pt-20">
                {/* Brand in drawer */}
                <div className="mb-8 pb-6 border-b border-border/50">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl",
                        "bg-gradient-to-br from-primary to-primary/80",
                        "shadow-sm shadow-primary/20"
                      )}
                    >
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-foreground">
                        Sistema de Minutas
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        Cartorio Pro
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 space-y-2">
                  {navItems.map((item, index) => {
                    const isActive =
                      location.pathname === item.href ||
                      location.pathname.startsWith(item.href + "/");

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl",
                            "text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Quick Action - Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-4"
                  >
                    <Link
                      to="/minuta/nova"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl",
                        "bg-primary text-primary-foreground",
                        "text-sm font-medium",
                        "shadow-md shadow-primary/20",
                        "transition-all duration-200",
                        "active:scale-[0.98]"
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Nova Minuta</span>
                    </Link>
                  </motion.div>
                </div>

                {/* Footer with Theme Switcher and Logout */}
                <div className="pt-6 border-t border-border/50 space-y-4">
                  {/* User info - Mobile */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 px-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {profile?.nome || 'Usuario'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tema</span>
                    <ThemeSwitcherCompact />
                  </div>

                  {/* Logout Button - Mobile */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl",
                        "text-sm font-medium",
                        "bg-destructive/10 text-destructive",
                        "transition-all duration-200",
                        "hover:bg-destructive/20",
                        "active:scale-[0.98]"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav - Desktop only */}
      <div className="hidden lg:block h-16" />
    </>
  );
}
