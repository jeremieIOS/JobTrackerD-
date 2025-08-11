import { useState, useEffect } from 'react'

interface NetworkState {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
  effectiveType: string | null
}

export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null,
    effectiveType: null
  })

  useEffect(() => {
    // Update network information
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      const isSlowConnection = connection ? 
        (connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.downlink < 1.5) : false

      setNetworkState({
        isOnline: navigator.onLine,
        isSlowConnection,
        connectionType: connection?.type || null,
        effectiveType: connection?.effectiveType || null
      })
    }

    // Initial check
    updateNetworkInfo()

    // Event listeners
    const handleOnline = () => {
      console.log('📶 Network: Back online')
      updateNetworkInfo()
    }

    const handleOffline = () => {
      console.log('📵 Network: Gone offline')
      updateNetworkInfo()
    }

    const handleConnectionChange = () => {
      console.log('🔄 Network: Connection changed')
      updateNetworkInfo()
    }

    // Add listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection API listeners (if supported)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return networkState
}

// Hook for handling offline actions
export function useOfflineActions() {
  const { isOnline } = useNetwork()
  const [pendingActions, setPendingActions] = useState<any[]>([])

  const addPendingAction = (action: any) => {
    if (!isOnline) {
      setPendingActions(prev => [...prev, action])
      
      // Store in localStorage for persistence
      const stored = localStorage.getItem('pendingActions')
      const existing = stored ? JSON.parse(stored) : []
      localStorage.setItem('pendingActions', JSON.stringify([...existing, action]))
      
      return true // Action was queued
    }
    return false // Action should be executed immediately
  }

  const processPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return

    console.log(`🔄 Processing ${pendingActions.length} pending actions...`)
    
    for (const action of pendingActions) {
      try {
        // Process action (would be implemented based on action type)
        console.log('Processing action:', action)
        
        // Remove from pending
        setPendingActions(prev => prev.filter(a => a.id !== action.id))
        
        // Remove from localStorage
        const stored = localStorage.getItem('pendingActions')
        if (stored) {
          const existing = JSON.parse(stored)
          const updated = existing.filter((a: any) => a.id !== action.id)
          localStorage.setItem('pendingActions', JSON.stringify(updated))
        }
      } catch (error) {
        console.error('Failed to process pending action:', error)
      }
    }
  }

  // Process pending actions when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      processPendingActions()
    }

    // Load pending actions from localStorage on mount
    const stored = localStorage.getItem('pendingActions')
    if (stored) {
      const actions = JSON.parse(stored)
      setPendingActions(actions)
    }
  }, [isOnline])

  return {
    addPendingAction,
    pendingActions,
    processPendingActions
  }
}

// Hook for network-aware data fetching
export function useNetworkAwareQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number
    cacheKey: string
    fallbackData?: T
  }
) {
  const { isOnline, isSlowConnection } = useNetwork()
  const [data, setData] = useState<T | undefined>(options.fallbackData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isOnline) {
      // Try to load from cache
      const cached = localStorage.getItem(`cache_${options.cacheKey}`)
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const isStale = options.staleTime ? 
            Date.now() - timestamp > options.staleTime : false
          
          if (!isStale) {
            setData(cachedData)
            return
          }
        } catch (e) {
          console.warn('Failed to parse cached data:', e)
        }
      }
      
      // Use fallback data if available
      if (options.fallbackData) {
        setData(options.fallbackData)
      }
      return
    }

    // Online - fetch data
    setIsLoading(true)
    setError(null)

    queryFn()
      .then(result => {
        setData(result)
        
        // Cache the result
        localStorage.setItem(`cache_${options.cacheKey}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }))
      })
      .catch(err => {
        setError(err)
        
        // Try to use cached data on error
        const cached = localStorage.getItem(`cache_${options.cacheKey}`)
        if (cached) {
          try {
            const { data: cachedData } = JSON.parse(cached)
            setData(cachedData)
          } catch (e) {
            console.warn('Failed to use cached data on error:', e)
          }
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isOnline, options.cacheKey])

  return {
    data,
    isLoading,
    error,
    isOnline,
    isSlowConnection
  }
}
