import { onCLS, onFCP, onLCP, onTTFB, onINP, type ReportCallback } from 'web-vitals'
import { reportError } from './sentry'

interface VitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Performance thresholds for Job Tracker
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },  // Largest Contentful Paint
  FID: { good: 100, poor: 300 },    // First Input Delay  
  CLS: { good: 0.1, poor: 0.25 },   // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },  // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },  // Time to First Byte
  INP: { good: 200, poor: 500 }     // Interaction to Next Paint
}

// Rate performance metrics
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Send metric to analytics
function sendToAnalytics({ name, value, rating, id }: VitalsMetric) {
  // In production, send to your analytics service
  if (import.meta.env.PROD) {
    // Example: Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', name, {
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        metric_id: id,
        metric_rating: rating,
        custom_map: {
          metric_name: name
        }
      })
    }
    
    // Example: Send to your own analytics endpoint
    fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        value,
        rating,
        id,
        timestamp: Date.now(),
        url: window.location.href,
        user_agent: navigator.userAgent
      })
    }).catch(error => {
      console.warn('Failed to send vitals:', error)
    })
  }
  
  // Development logging
  if (import.meta.env.DEV) {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(`${emoji} ${name}: ${value.toFixed(2)} (${rating})`)
  }
}

// Report callback for all metrics
const reportWebVitals: ReportCallback = (metric) => {
  const vitalsMetric: VitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: rateMetric(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id
  }
  
  sendToAnalytics(vitalsMetric)
  
  // Report poor performance as errors to Sentry
  if (vitalsMetric.rating === 'poor') {
    reportError(new Error(`Poor Web Vital: ${metric.name}`), {
      metric: vitalsMetric,
      url: window.location.href,
      timestamp: Date.now()
    })
  }
}

// Initialize Web Vitals monitoring
export function initPerformanceMonitoring() {
  try {
    // Core Web Vitals
    onCLS(reportWebVitals)
    onLCP(reportWebVitals)
    onINP(reportWebVitals)
    
    // Additional metrics
    onFCP(reportWebVitals)
    onTTFB(reportWebVitals)
    
    console.log('🚀 Performance monitoring initialized')
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error)
  }
}

// Custom performance markers
export class PerformanceTracker {
  private static marks: Map<string, number> = new Map()
  
  static mark(name: string) {
    const timestamp = performance.now()
    this.marks.set(name, timestamp)
    
    if (import.meta.env.DEV) {
      console.log(`📊 Performance mark: ${name} at ${timestamp.toFixed(2)}ms`)
    }
  }
  
  static measure(name: string, startMark: string) {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }
    
    const duration = performance.now() - startTime
    
    // Send to analytics
    if (import.meta.env.PROD) {
      sendToAnalytics({
        name: `custom_${name}`,
        value: duration,
        rating: duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor',
        delta: duration,
        id: `${name}-${Date.now()}`
      })
    }
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  // Track React component render time
  static trackComponentRender(componentName: string) {
    const markName = `${componentName}-render-start`
    this.mark(markName)
    
    return () => {
      this.measure(`${componentName}-render`, markName)
    }
  }
  
  // Track API call duration
  static trackApiCall(endpoint: string) {
    const markName = `api-${endpoint}-start`
    this.mark(markName)
    
    return {
      success: () => this.measure(`api-${endpoint}-success`, markName),
      error: () => this.measure(`api-${endpoint}-error`, markName)
    }
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
    
    if (import.meta.env.DEV) {
      console.log('🧠 Memory usage:', memoryInfo)
    }
    
    // Alert if memory usage is high
    if (memoryInfo.usagePercentage > 80) {
      console.warn('⚠️ High memory usage detected:', memoryInfo.usagePercentage.toFixed(2) + '%')
      
      if (import.meta.env.PROD) {
        reportError(new Error('High memory usage'), { memoryInfo })
      }
    }
    
    return memoryInfo
  }
  
  return null
}

// Network connection monitoring
export function monitorNetworkConnection() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const networkInfo = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
    
    if (import.meta.env.DEV) {
      console.log('🌐 Network info:', networkInfo)
    }
    
    return networkInfo
  }
  
  return null
}
