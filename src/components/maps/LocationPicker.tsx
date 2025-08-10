import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Button } from '../ui/Button'
import { MapPin, Crosshair, X } from 'lucide-react'

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
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured')
      setIsLoading(false)
      return
    }

    initializeMap()
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
        geocodeLatLng(initialLocation.lat, initialLocation.lng)
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

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading Google Maps:', err)
      setError('Failed to load Google Maps')
      setIsLoading(false)
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
        <div className="p-4 border-b border-gray-200">
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
              <div className="text-sm text-gray-600">
                {address && <div className="mb-1">{address}</div>}
                <div>
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </div>
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
