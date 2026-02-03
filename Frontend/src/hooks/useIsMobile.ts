import { useState, useEffect, useCallback } from 'react';

/**
 * Detecta se o dispositivo é mobile (não tablet)
 * Funciona para iOS, Android, e outros dispositivos móveis
 *
 * Critério principal: largura da tela < breakpoint (768px)
 * Exceção: tablets identificados por user agent são excluídos
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    // SSR safe - assume desktop por padrão
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  const checkIsMobile = useCallback(() => {
    // Critério principal: largura da tela
    const isSmallScreen = window.innerWidth < breakpoint;

    // Se não é tela pequena, não é mobile
    if (!isSmallScreen) return false;

    // Verificar se é tablet por user agent (excluir iPads e tablets Android)
    const userAgent = navigator.userAgent.toLowerCase();
    const isTabletUserAgent =
      userAgent.includes('ipad') ||
      (userAgent.includes('tablet') && !userAgent.includes('mobile')) ||
      (userAgent.includes('android') && !userAgent.includes('mobile'));

    // É mobile se tela pequena E NÃO é tablet
    return isSmallScreen && !isTabletUserAgent;
  }, [breakpoint]);

  useEffect(() => {
    // Verificação inicial
    setIsMobile(checkIsMobile());

    // Listener para mudanças de tamanho de tela
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    // Listener para mudanças de orientação
    const handleOrientationChange = () => {
      // Pequeno delay para garantir que as dimensões foram atualizadas
      setTimeout(() => setIsMobile(checkIsMobile()), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [checkIsMobile]);

  return isMobile;
}

/**
 * Hook auxiliar para detectar se é tablet
 * Tablets: tela entre 768px e 1024px OU identificado por user agent
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();

      // Tablets por tamanho: entre 768px e 1024px
      const isTabletSize = width >= 768 && width < 1024;

      // Tablets por user agent
      const isTabletUserAgent =
        userAgent.includes('ipad') ||
        userAgent.includes('tablet') ||
        (userAgent.includes('android') && !userAgent.includes('mobile'));

      return isTabletSize || isTabletUserAgent;
    };

    setIsTablet(checkIsTablet());

    const handleResize = () => setIsTablet(checkIsTablet());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
}
