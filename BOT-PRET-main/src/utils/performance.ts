import { logger } from './logger.js';

/**
 * Performance monitoring utilities
 */

interface MemoryUsageInfo {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapUsedMB: string;
  heapTotalMB: string;
  rssMB: string;
}

/**
 * Get current memory usage
 */
export function getMemoryUsage(): MemoryUsageInfo {
  const usage = process.memoryUsage();
  
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    heapUsedMB: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotalMB: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    rssMB: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
  };
}

/**
 * Log memory usage
 */
export function logMemoryUsage(context?: string): void {
  const usage = getMemoryUsage();
  
  logger.info(`Memory usage${context ? ` (${context})` : ''}:`, {
    heapUsed: usage.heapUsedMB,
    heapTotal: usage.heapTotalMB,
    rss: usage.rssMB,
  });
}

/**
 * Monitor memory usage periodically
 */
export function startMemoryMonitoring(intervalMs: number = 300000): NodeJS.Timer {
  // Log initial usage
  logMemoryUsage('startup');
  
  // Setup periodic logging
  return setInterval(() => {
    const usage = getMemoryUsage();
    
    // Only log if heap usage is above 80%
    const heapPercentage = (usage.heapUsed / usage.heapTotal) * 100;
    if (heapPercentage > 80) {
      logger.warn('High memory usage detected:', {
        heapUsed: usage.heapUsedMB,
        heapTotal: usage.heapTotalMB,
        percentage: `${heapPercentage.toFixed(1)}%`,
      });
    }
  }, intervalMs);
}

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number> = new Map();
  
  constructor() {
    this.startTime = Date.now();
  }
  
  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());
  }
  
  /**
   * Get duration from start
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }
  
  /**
   * Get duration between marks
   */
  getDurationBetween(mark1: string, mark2: string): number | null {
    const time1 = this.marks.get(mark1);
    const time2 = this.marks.get(mark2);
    
    if (!time1 || !time2) {
      return null;
    }
    
    return Math.abs(time2 - time1);
  }
  
  /**
   * Log all marks
   */
  logMarks(context: string): void {
    const marks = Array.from(this.marks.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([name, time]) => ({
        name,
        elapsed: time - this.startTime,
      }));
    
    logger.info(`Performance marks for ${context}:`, marks);
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label} took ${duration}ms`);
    } else {
      logger.debug(`Operation ${label} completed in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Operation ${label} failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
