/**
 * 성능 측정 훅
 */

import { useEffect, useRef } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(performance.now());
  const renderStartRef = useRef<number>(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - mountTimeRef.current;
    performanceMonitor.recordComponentPerformance(componentName, 0, mountTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    performanceMonitor.recordComponentPerformance(componentName, renderTime);
    renderStartRef.current = performance.now();
    // Intentionally run on every render for render timing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return {
    measure: (name: string) => performanceMonitor.startMeasure(`${componentName}:${name}`),
  };
};

