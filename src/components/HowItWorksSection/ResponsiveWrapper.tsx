"use client";
import React, { useState, useEffect } from 'react';
import { ResponsiveWrapperProps } from './types';

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = React.memo(({
  children,
  breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  }
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect current breakpoint based on window width
  useEffect(() => {
    const detectBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.mobile) {
        setCurrentBreakpoint('mobile');
      } else if (width < breakpoints.tablet) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    // Initial detection
    detectBreakpoint();

    // Add resize listener with debouncing for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedDetectBreakpoint = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(detectBreakpoint, 150);
    };

    window.addEventListener('resize', debouncedDetectBreakpoint);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedDetectBreakpoint);
    };
  }, [breakpoints]);

  // Generate responsive classes based on current breakpoint
  const getResponsiveClasses = () => {
    const baseClasses = 'responsive-wrapper transition-all duration-300 ease-in-out';
    
    switch (currentBreakpoint) {
      case 'mobile':
        return `${baseClasses} flex flex-col space-y-6 items-center`;
      case 'tablet':
        return `${baseClasses} grid grid-cols-2 gap-6 items-start justify-items-center`;
      case 'desktop':
      default:
        return `${baseClasses} flex flex-row space-x-6 items-center justify-center`;
    }
  };

  return (
    <div
      className={getResponsiveClasses()}
      data-testid="responsive-wrapper"
      data-breakpoint={currentBreakpoint}
    >
      {children}
    </div>
  );
});

ResponsiveWrapper.displayName = 'ResponsiveWrapper';