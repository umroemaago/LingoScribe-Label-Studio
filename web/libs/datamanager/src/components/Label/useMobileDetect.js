import { useState, useEffect } from 'react';

export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      try {
        if (typeof window !== 'undefined' && window.innerWidth !== undefined) {
          setIsMobile(window.innerWidth <= 768);
        } else {
          setIsMobile(false);
        }
      } catch (error) {
        console.warn('Mobile detection error:', error);
        setIsMobile(false);
      }
    };

    // Initial check
    checkMobile();
    
    // Add event listener only if window is available
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        try {
          checkMobile();
        } catch (error) {
          console.warn('Resize handler error:', error);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return isMobile;
};