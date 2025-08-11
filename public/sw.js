// Service Worker for Job Tracker PWA
const CACHE_NAME = 'job-tracker-v1'
const STATIC_CACHE = 'job-tracker-static-v1'
const DYNAMIC_CACHE = 'job-tracker-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/jobs/,
  /\/api\/teams/,
  /\/api\/notifications/
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error)
      })
  )
  
  // Force activation of new service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cache)
              return caches.delete(cache)
            }
          })
        )
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (isStaticFile(request)) {
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag)
  
  if (event.tag === 'job-sync') {
    event.waitUntil(syncJobs())
  } else if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')
  
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'general',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Job Tracker', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/dashboard')
    )
  }
})

// Helper functions
function isStaticFile(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/icons/') ||
         request.url.endsWith('.js') ||
         request.url.endsWith('.css') ||
         request.url.endsWith('.png') ||
         request.url.endsWith('.jpg') ||
         request.url.endsWith('.ico')
}

function isAPIRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         request.url.includes('/api/') ||
         request.url.includes('supabase.co')
}

// Cache strategies
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request)
    return cached || fetch(request)
  } catch (error) {
    console.error('Service Worker: Cache first error:', error)
    return fetch(request)
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache')
    const cached = await caches.match(request)
    
    if (cached) {
      return cached
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cached)
  
  return cached || fetchPromise
}

// Background sync functions
async function syncJobs() {
  try {
    // Get pending jobs from IndexedDB or localStorage
    const pendingJobs = await getPendingJobs()
    
    for (const job of pendingJobs) {
      try {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(job)
        })
        
        if (response.ok) {
          await removePendingJob(job.id)
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync job:', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Job sync failed:', error)
  }
}

async function syncNotifications() {
  try {
    // Sync notification preferences or pending notifications
    console.log('Service Worker: Syncing notifications...')
  } catch (error) {
    console.error('Service Worker: Notification sync failed:', error)
  }
}

// Placeholder functions for offline storage
async function getPendingJobs() {
  // Implementation would use IndexedDB
  return []
}

async function removePendingJob(jobId) {
  // Implementation would remove from IndexedDB
  console.log('Service Worker: Removing pending job:', jobId)
}
