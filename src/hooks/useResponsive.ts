import { useState, useEffect, useCallback } from 'react';

const BREAKPOINTS = {
  smallMobile: 375,
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
  largeDesktop: 1536,
} as const;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const handleResize = useCallback(() => {
    setWindowSize({ 
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    // Debounced resize handler for performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  const isSmallMobile = windowSize.width < BREAKPOINTS.smallMobile;
  const isMobile = windowSize.width < BREAKPOINTS.mobile;
  const isTablet = windowSize.width >= BREAKPOINTS.mobile && windowSize.width < BREAKPOINTS.tablet;
  const isDesktop = windowSize.width >= BREAKPOINTS.tablet;
  const isLargeDesktop = windowSize.width >= BREAKPOINTS.largeDesktop;
  const isLandscape = windowSize.width > windowSize.height;

  return {
    // Breakpoint flags
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isLandscape,
    
    // Combined helpers
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
    
    // Raw dimensions
    width: windowSize.width,
    height: windowSize.height,
    
    // Breakpoint values for reference
    breakpoints: BREAKPOINTS,
  };
}
