// src/pages/LandingPage/components/LandingHeader.tsx
// Premium fixed header for landing page with glassmorphism effect

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppUrl } from '@/lib/domain';
import { ThemeSwitcherCompact } from '@/components/ui/theme-switcher';

const navLinks = [
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16',
          'transition-all duration-300',
          isScrolled
            ? 'bg-card/80 backdrop-blur-2xl backdrop-saturate-180 border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo / Brand */}
          <a
            href="/landing-page"
            className={cn(
              'flex items-center gap-3 group',
              'transition-opacity duration-200 hover:opacity-80'
            )}
          >
            {/* Logo Icon */}
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl',
                'bg-gradient-to-br from-primary to-primary/80',
                'shadow-sm shadow-primary/20',
                'transition-transform duration-200 group-hover:scale-105'
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
          </a>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'relative px-4 py-2 rounded-lg',
                  'text-sm font-medium transition-all duration-200',
                  'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side - Theme Switcher & CTA */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <ThemeSwitcherCompact />

            {/* Divider */}
            <div className="w-px h-6 bg-border/50" />

            {/* CTA Button */}
            <a
              href={getAppUrl('/login')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary text-primary-foreground',
                'text-sm font-medium',
                'shadow-sm shadow-primary/20',
                'transition-all duration-200',
                'hover:shadow-md hover:shadow-primary/30 hover:scale-[1.02]',
                'active:scale-[0.98]'
              )}
            >
              <span>Acessar App</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'lg:hidden fixed top-4 right-4 z-50',
          'flex items-center justify-center w-11 h-11',
          'bg-card/85 backdrop-blur-xl backdrop-saturate-150',
          'border border-border/40 rounded-xl',
          'shadow-lg shadow-black/10',
          'transition-all duration-200',
          isOpen && 'bg-secondary/90'
        )}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isOpen ? 'close' : 'open'}
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
            <a href="/landing-page" className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl',
                  'bg-gradient-to-br from-primary to-primary/80',
                  'shadow-md shadow-primary/20'
                )}
              >
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
            </a>
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
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className={cn(
                'lg:hidden fixed top-0 right-0 bottom-0 w-72 z-40',
                'bg-card/90 backdrop-blur-2xl backdrop-saturate-150',
                'border-l border-border/40',
                'shadow-2xl shadow-black/20'
              )}
            >
              <div className="flex flex-col h-full p-6 pt-20">
                {/* Brand in drawer */}
                <div className="mb-8 pb-6 border-b border-border/50">
                  <a
                    href="/landing-page"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-xl',
                        'bg-gradient-to-br from-primary to-primary/80',
                        'shadow-sm shadow-primary/20'
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
                  </a>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl',
                          'text-sm font-medium transition-all duration-200',
                          'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                      >
                        <span>{link.label}</span>
                      </a>
                    </motion.div>
                  ))}

                  {/* CTA - Mobile */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-4"
                  >
                    <a
                      href={getAppUrl('/login')}
                      className={cn(
                        'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl',
                        'bg-primary text-primary-foreground',
                        'text-sm font-medium',
                        'shadow-md shadow-primary/20',
                        'transition-all duration-200',
                        'active:scale-[0.98]'
                      )}
                    >
                      <span>Acessar App</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                </div>

                {/* Footer with Theme Switcher */}
                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tema</span>
                    <ThemeSwitcherCompact />
                  </div>
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
