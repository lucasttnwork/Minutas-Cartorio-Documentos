// src/components/ui/theme-switcher.tsx
// Premium theme toggle component with elegant animation
// Inspired by Linear and Apple design principles

/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

interface ThemeSwitcherProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Initialize theme from localStorage or system preference
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

// Apply theme to document
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  localStorage.setItem("theme", theme);
}

// Custom hook to check if component is mounted (SSR-safe)
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeSwitcher({ className, size = "md" }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const mounted = useIsMounted();

  // Apply theme on changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      // Only update if user hasn't set a preference
      if (!stored) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark = theme === "dark";

  // Size variants
  const sizeConfig = {
    sm: { button: "w-14 h-7", icon: "w-3.5 h-3.5", thumb: "w-5 h-5" },
    md: { button: "w-16 h-8", icon: "w-4 h-4", thumb: "w-6 h-6" },
    lg: { button: "w-20 h-10", icon: "w-5 h-5", thumb: "w-8 h-8" },
  };

  const { button, icon, thumb } = sizeConfig[size];

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          button,
          "rounded-full bg-muted animate-pulse",
          className
        )}
      />
    );
  }

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center p-1 rounded-full cursor-pointer",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        button,
        isDark
          ? "bg-secondary border border-border"
          : "bg-secondary border border-border",
        className
      )}
      whileTap={{ scale: 0.95 }}
    >
      {/* Track icons (sun and moon in background) */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun
          className={cn(
            icon,
            "transition-all duration-300",
            isDark ? "text-muted-foreground/40" : "text-amber-500"
          )}
        />
        <Moon
          className={cn(
            icon,
            "transition-all duration-300",
            isDark ? "text-primary" : "text-muted-foreground/40"
          )}
        />
      </div>

      {/* Animated thumb */}
      <motion.div
        className={cn(
          thumb,
          "relative z-10 rounded-full",
          "shadow-sm border",
          isDark
            ? "bg-card border-border"
            : "bg-card border-border"
        )}
        layout
        initial={false}
        animate={{
          x: isDark ? "calc(100% + 2px)" : "0%",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Inner icon in thumb */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? (
              <Moon className={cn(icon, "text-primary")} strokeWidth={2} />
            ) : (
              <Sun className={cn(icon, "text-amber-500")} strokeWidth={2} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

// Compact version for tight spaces (icon only)
export function ThemeSwitcherCompact({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const mounted = useIsMounted();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-9 h-9 rounded-lg bg-muted animate-pulse",
          className
        )}
      />
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-lg",
        "bg-secondary/50 hover:bg-secondary",
        "border border-transparent hover:border-border",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-primary" strokeWidth={2} />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" strokeWidth={2} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// Hook for external theme control
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setLightTheme = useCallback(() => setTheme("light"), []);
  const setDarkTheme = useCallback(() => setTheme("dark"), []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setTheme,
  };
}
