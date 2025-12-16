import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < BREAKPOINTS.mobile,
    isTablet: windowSize.width >= BREAKPOINTS.mobile && windowSize.width < BREAKPOINTS.tablet,
    isDesktop: windowSize.width >= BREAKPOINTS.tablet,
    isLargeDesktop: windowSize.width >= BREAKPOINTS.desktop,
    width: windowSize.width,
  };
}
