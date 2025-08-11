import { useState, useEffect } from 'react'
import { useNetwork } from '../../hooks/useNetwork'
import { Button } from '@/components/ui/button'
import { RefreshCw, Wifi, WifiOff, Download, X } from 'lucide-react'

interface UpdateNotificationProps {
  onUpdate?: () => void
}

export function UpdateNotification({ onUpdate }: UpdateNotificationProps) {
  const { isOnline, isSlowConnection } = useNetwork()
  const [showOfflineNotice, setShowOfflineNotice] = useState(false)
  const [showUpdateAvailable, setShowUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Show offline notice after being offline for 3 seconds
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineNotice(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      setShowOfflineNotice(false)
    }
  }, [isOnline])

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdateAvailable(true)
      })

      // Listen for waiting service worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        
        // Skip waiting and reload
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
      onUpdate?.()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  const dismissUpdate = () => {
    setShowUpdateAvailable(false)
  }

  const dismissOffline = () => {
    setShowOfflineNotice(false)
  }

  return (
    <>
      {/* Offline Notification */}
      {showOfflineNotice && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WifiOff className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    You're offline
                  </p>
                  <p className="text-xs text-yellow-600">
                    Some features may be limited
                  </p>
                </div>
              </div>
              <button
                onClick={dismissOffline}
                className="text-yellow-400 hover:text-yellow-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Online Notification */}
      {isOnline && showOfflineNotice && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Back online!
                </p>
                <p className="text-xs text-green-600">
                  All features are now available
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slow Connection Warning */}
      {isOnline && isSlowConnection && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-orange-700">
                Slow connection detected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Notification */}
      {showUpdateAvailable && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Update available
                  </p>
                  <p className="text-xs text-blue-600">
                    Refresh to get the latest features
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissUpdate}
                  disabled={isUpdating}
                >
                  Later
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex items-center space-x-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      <span>Update</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Install prompt component
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const dismissInstall = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            Install Job Tracker
          </h3>
          <button
            onClick={dismissInstall}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Install the app for quick access and offline features
        </p>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={dismissInstall}
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
