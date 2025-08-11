import * as Sentry from "@sentry/react"

// Initialize Sentry for error monitoring
export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors
        const error = hint.originalException
        
        // Don't send network errors in development
        if (import.meta.env.DEV && event.exception) {
          return null
        }
        
        // Don't send quota exceeded errors (localStorage)
        if (error && error.toString().includes('QuotaExceededError')) {
          return null
        }
        
        return event
      },
      
      // Set user context
      initialScope: {
        tags: {
          component: "job-tracker"
        }
      },
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration({
          // Capture interactions like clicks, navigations
          enableInp: true,
        }),
        Sentry.replayIntegration(),
      ]
    })
  }
}

// Error boundary fallback component
export const SentryErrorBoundary = Sentry.withErrorBoundary

// Custom error reporting
export function reportError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("Additional Info", context)
      }
      Sentry.captureException(error)
    })
  } else {
    console.error("Error reported:", error, context)
  }
}

// Performance monitoring
export function startTransaction(name: string) {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    return Sentry.startSpan({ name }, () => {})
  }
  return null
}

// User context setting
export function setSentryUser(user: { id: string; email?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email
  })
}

// Clear user context on logout
export function clearSentryUser() {
  Sentry.setUser(null)
}
