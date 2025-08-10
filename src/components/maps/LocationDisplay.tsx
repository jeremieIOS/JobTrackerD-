import { MapPin, ExternalLink } from 'lucide-react'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface LocationDisplayProps {
  location: LocationData
  className?: string
  showAddress?: boolean
  showMapLink?: boolean
}

export function LocationDisplay({ 
  location, 
  className = '', 
  showAddress = true, 
  showMapLink = true 
}: LocationDisplayProps) {
  const handleOpenInMaps = () => {
    const { lat, lng } = location
    const mapsUrl = `https://maps.google.com/maps?q=${lat},${lng}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {showAddress && location.address ? (
          <div className="text-sm text-gray-600 truncate">
            {location.address}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}
        
        {showMapLink && (
          <button
            onClick={handleOpenInMaps}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-1"
          >
            <ExternalLink size={10} />
            Open in Maps
          </button>
        )}
      </div>
    </div>
  )
}
