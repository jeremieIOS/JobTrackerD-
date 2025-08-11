import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Button } from '../ui/Button'
import { MapPin, Crosshair, X, Search } from 'lucide-react'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface LocationPickerProps {
  initialLocation?: LocationData
  onLocationSelect: (location: LocationData) => void
  onClose: () => void
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function LocationPicker({ initialLocation, onLocationSelect, onClose }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [address, setAddress] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured')
      setIsLoading(false)
      return
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geocoding']
      })

      await loader.load()

      if (!mapRef.current) return

      // Default location (Paris) or user's initial location
      const defaultLocation = initialLocation || { lat: 48.8566, lng: 2.3522 }

      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      mapInstanceRef.current = map

      // Add marker
      const marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Job Location'
      })

      markerRef.current = marker

      // Set initial location
      if (initialLocation) {
        setLocation(initialLocation)
        if (initialLocation.address) {
          setAddress(initialLocation.address)
          setSearchInput(initialLocation.address)
        } else {
          geocodeLatLng(initialLocation.lat, initialLocation.lng)
        }
      }

      // Handle marker drag
      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          }
          setLocation(newLocation)
          geocodeLatLng(newLocation.lat, newLocation.lng)
        }
      })

      // Handle map click
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }
          marker.setPosition(event.latLng)
          setLocation(newLocation)
          geocodeLatLng(newLocation.lat, newLocation.lng)
        }
      })

      // Initialize autocomplete after map is loaded
      initializeAutocomplete()
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading Google Maps:', err)
      setError('Failed to load Google Maps')
      setIsLoading(false)
    }
  }

  const initializeAutocomplete = () => {
    if (!searchInputRef.current) return

    try {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'fr' } // Peut être retiré pour recherche mondiale
      })

      autocompleteRef.current = autocomplete

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        if (!place.geometry || !place.geometry.location) {
          setError('No details available for input: ' + place.name)
          return
        }

        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }

        setLocation(newLocation)
        setAddress(place.formatted_address || '')
        setSearchInput(place.formatted_address || '')

        // Update map and marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(newLocation)
          mapInstanceRef.current.setZoom(15)
          markerRef.current.setPosition(newLocation)
        }
      })
    } catch (error) {
      console.log('Places API not available, using fallback')
      // Fallback : recherche manuelle par géocodage
      addManualSearchFallback()
    }
  }

  const addManualSearchFallback = () => {
    if (!searchInputRef.current) return
    
    searchInputRef.current.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        await searchAddressManually(searchInputRef.current?.value || '')
      }
    })
  }

  const searchAddressManually = async (address: string) => {
    if (!address.trim()) return
    
    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({ address })
      
      if (response.results && response.results[0]) {
        const result = response.results[0]
        const newLocation = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        }
        
        setLocation(newLocation)
        setAddress(result.formatted_address)
        setSearchInput(result.formatted_address)
        
        // Update map and marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(newLocation)
          mapInstanceRef.current.setZoom(15)
          markerRef.current.setPosition(newLocation)
        }
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      setError('Address search failed. Please try clicking on the map instead.')
    }
  }

  const geocodeLatLng = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({
        location: { lat, lng }
      })

      if (response.results && response.results[0]) {
        const formattedAddress = response.results[0].formatted_address
        setAddress(formattedAddress)
        setSearchInput(formattedAddress)
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        setLocation(userLocation)
        geocodeLatLng(userLocation.lat, userLocation.lng)

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(userLocation)
          mapInstanceRef.current.setZoom(15)
          markerRef.current.setPosition(userLocation)
        }

        setIsLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Unable to get your location')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleSaveLocation = () => {
    if (location) {
      onLocationSelect({
        ...location,
        address: address || undefined
      })
    }
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Location Picker</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Google Maps API key not configured</p>
            <p className="text-sm text-gray-500">
              To use location features, add your Google Maps API key to the environment variables.
            </p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Select Job Location</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          {/* Address Search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type address and press Enter..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Crosshair size={16} />
              Use My Location
            </Button>
            
            {location && (
              <div className="text-sm text-gray-600 text-right">
                <div className="text-xs text-gray-500 mb-1">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </div>
                {address && (
                  <div className="max-w-64 truncate" title={address}>
                    {address}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-2">Error loading map</p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveLocation} 
            disabled={!location}
            className="flex items-center gap-2"
          >
            <MapPin size={16} />
            Save Location
          </Button>
        </div>
      </div>
    </div>
  )
}
