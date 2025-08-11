import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { ErrorBoundary } from '../error/ErrorBoundary'
import { Loader2 } from 'lucide-react'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}

// Loading skeleton component
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

// Centered loading spinner
export function CenteredLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}

// Main lazy wrapper component
export function LazyWrapper({ 
  children, 
  fallback = <CenteredLoading />,
  errorFallback 
}: LazyWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  loadingComponent?: ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper fallback={loadingComponent}>
        <WrappedComponent {...props} />
      </LazyWrapper>
    )
  }
}

// Performance monitoring hook
export function usePerformance(componentName: string) {
  const startTime = performance.now()
  
  return {
    measure: () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName} render time: ${renderTime.toFixed(2)}ms`)
        
        // Log slow renders
        if (renderTime > 100) {
          console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
        }
      }
      
      return renderTime
    }
  }
}
