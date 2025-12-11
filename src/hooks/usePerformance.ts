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
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    performanceMonitor.recordComponentPerformance(componentName, renderTime);
    renderStartRef.current = performance.now();
  });

  return {
    measure: (name: string) => performanceMonitor.startMeasure(`${componentName}:${name}`),
  };
};

