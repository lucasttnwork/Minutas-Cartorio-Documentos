// src/components/layout/HubSidebar.tsx
// Premium sidebar navigation for Dashboard hub
// Inspired by Linear's clean sidebar design

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Bot, ChevronLeft, LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    to: "/dashboard/minutas",
    label: "Minutas",
    icon: FileText,
    description: "Gerenciar minutas",
  },
  {
    to: "/dashboard/agentes",
    label: "Agentes",
    icon: Bot,
    description: "Agentes de IA",
  },
];

interface HubSidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
}

export function HubSidebar({
  className,
  defaultCollapsed = false,
}: HubSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const userName = profile?.nome || 'Usuario';
  const userEmail = profile?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex flex-col min-h-screen",
        "bg-card/60 backdrop-blur-xl backdrop-saturate-150",
        "border-r border-border/40",
        "transition-all duration-300 ease-out",
        isCollapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 px-4",
          "border-b border-border/50",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  "bg-primary/10 text-primary"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Dashboard
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Selecione uma opção
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md",
            "bg-secondary/50 hover:bg-secondary",
            "text-muted-foreground hover:text-foreground",
            "border border-transparent hover:border-border/50",
            "transition-all duration-200"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, index) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive: navActive }) =>
                  cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "transition-all duration-200",
                    isCollapsed && "justify-center",
                    navActive || isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-[1.02]"
                  )
                }
                style={{
                  boxShadow: isActive
                    ? "0 0 20px oklch(from var(--primary) l c h / 0.20), 0 4px 12px oklch(from var(--primary) l c h / 0.10)"
                    : "none"
                }}
              >
                {/* Active Indicator Bar - ENHANCED with glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full",
                      "bg-gradient-to-b from-primary via-primary to-primary/70"
                    )}
                    style={{
                      boxShadow: "0 0 12px oklch(from var(--primary) l c h / 0.50), 0 0 4px oklch(from var(--primary) l c h / 0.30)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center",
                    "transition-transform duration-200",
                    "group-hover:scale-110"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive && "text-primary"
                    )}
                  />
                </div>

                {/* Label & Description */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col overflow-hidden"
                    >
                      <span
                        className={cn(
                          "text-sm font-medium whitespace-nowrap",
                          isActive && "text-primary font-semibold"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {item.description}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    className={cn(
                      "absolute left-full ml-2 px-2 py-1 rounded-md",
                      "bg-popover text-popover-foreground text-sm font-medium",
                      "border border-border/50 shadow-md",
                      "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                      "transition-all duration-200",
                      "whitespace-nowrap z-50"
                    )}
                  >
                    {item.label}
                  </div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-border/50"
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  "bg-gradient-to-br from-primary/20 to-primary/10",
                  "text-primary text-xs font-bold"
                )}
              >
                {userInitial}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {userEmail}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 w-full mt-2 px-3 py-2 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-destructive/10 hover:text-destructive",
                "transition-all duration-200"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

// Simplified version for mobile (drawer style)
export function HubSidebarMobile({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed top-0 left-0 bottom-0 z-50 w-72",
              "bg-card/90 backdrop-blur-2xl backdrop-saturate-150",
              "border-r border-border/40",
              "shadow-2xl shadow-black/20",
              "lg:hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    "bg-primary/10 text-primary"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Dashboard
                </span>
              </div>

              <button
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  "bg-secondary/50 hover:bg-secondary",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors duration-200"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/");

                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-[1.02]"
                      )}
                      style={{
                        boxShadow: isActive
                          ? "0 0 16px oklch(from var(--primary) l c h / 0.15)"
                          : "none"
                      }}
                    >
                      <item.icon
                        className={cn("w-5 h-5", isActive && "text-primary")}
                      />
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isActive && "font-semibold"
                          )}
                        >
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-[10px] text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
