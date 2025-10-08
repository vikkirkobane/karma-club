// Performance utilities for optimization
import { useCallback, useMemo, useRef } from 'react';

// Debounce hook for search and input optimization
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Throttle hook for scroll and resize events
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  );
}

// Memoized calculations for expensive operations
export const useMemoizedCalculations = (
  points: number,
  activities: number
) => {
  return useMemo(() => {
    const level = Math.max(1, Math.floor(points / 100) + 1);
    const levelProgress = (points % 100);
    const nextLevelPoints = level * 100;
    const pointsToNext = nextLevelPoints - points;
    
    return {
      level,
      levelProgress,
      nextLevelPoints,
      pointsToNext,
      totalActivities: activities,
    };
  }, [points, activities]);
};

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, height?: number) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const baseUrl = url.split('/upload/')[0] + '/upload/';
  const imagePath = url.split('/upload/')[1];
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push('c_fill', 'q_auto', 'f_auto');
  
  return `${baseUrl}${transformations.join(',')}/${imagePath}`;
};

// Local storage with error handling
export const safeLocalStorage = {
  getItem: (key: string, defaultValue: unknown = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  },
  
  setItem: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage for key ${key}:`, error);
    }
  },
  
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key ${key}:`, error);
    }
  }
};

// Analytics helper (privacy-focused)
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Only track in production and if analytics is enabled
  const enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  
  if (enableAnalytics && import.meta.env.PROD) {
    // Implement your privacy-focused analytics here
    console.log('Event tracked:', eventName, properties);
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => unknown) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (import.meta.env.DEV) {
    console.log(`Performance [${name}]: ${end - start}ms`);
  }
  
  return result;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = () => {
  const observerRef = useRef<IntersectionObserver>();
  
  const observe = useCallback((element: Element, callback: () => void) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(element);
  }, []);
  
  return { observe };
};