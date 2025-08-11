import { useCallback } from 'react'

// Cache pour éviter les appels répétés
const geocodeCache = new Map<string, any>()
// const autocompleteCache = new Map<string, any>() // Commented for build fix

export function useGoogleMaps() {
  // Debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }, [])

  // Optimized geocoding with cache
  const geocodeAddress = useCallback(async (address: string) => {
    const cacheKey = address.toLowerCase().trim()
    
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey)
    }

    try {
      const geocoder = new google.maps.Geocoder()
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            address: address,
            region: 'FR', // Optimize for France
            componentRestrictions: { country: 'FR' }
          },
          (results, status) => {
            if (status === 'OK' && results?.[0]) {
              resolve(results[0])
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          }
        )
      })

      // Cache the result for 10 minutes
      geocodeCache.set(cacheKey, result)
      setTimeout(() => {
        geocodeCache.delete(cacheKey)
      }, 10 * 60 * 1000)

      return result
    } catch (error) {
      console.error('Geocoding error:', error)
      throw error
    }
  }, [])

  // Optimized reverse geocoding
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey)
    }

    try {
      const geocoder = new google.maps.Geocoder()
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            location: { lat, lng },
            region: 'FR'
          },
          (results, status) => {
            if (status === 'OK' && results?.[0]) {
              resolve(results[0].formatted_address)
            } else {
              reject(new Error(`Reverse geocoding failed: ${status}`))
            }
          }
        )
      })

      // Cache for 10 minutes
      geocodeCache.set(cacheKey, result)
      setTimeout(() => {
        geocodeCache.delete(cacheKey)
      }, 10 * 60 * 1000)

      return result
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [])

  // Check if Google Maps is loaded properly
  const isGoogleMapsLoaded = useCallback(() => {
    return (
      typeof google !== 'undefined' &&
      typeof google.maps !== 'undefined' &&
      typeof google.maps.Map !== 'undefined' &&
      typeof google.maps.places !== 'undefined'
    )
  }, [])

  // Error handling helper
  const handleMapError = useCallback((error: any) => {
    console.error('Google Maps Error:', error)
    
    if (error.message?.includes('quota')) {
      return 'API quota exceeded. Please check your Google Cloud billing.'
    } else if (error.message?.includes('key')) {
      return 'Invalid API key. Please check your configuration.'
    } else if (error.message?.includes('referer')) {
      return 'Domain not authorized. Check your API key restrictions.'
    } else {
      return `Google Maps error: ${error.message || 'Unknown error'}`
    }
  }, [])

  return {
    geocodeAddress,
    reverseGeocode,
    isGoogleMapsLoaded,
    handleMapError,
    debounce
  }
}
