'use client'

import { useRouter } from 'next/navigation'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Listing } from '@/types'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface ListingsMapProps {
  listings: Listing[]
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const router = useRouter()
  const withCoords = listings.filter((l) => l.lat && l.lng)

  if (withCoords.length === 0) return null

  const center: [number, number] = [
    withCoords.reduce((s, l) => s + l.lat, 0) / withCoords.length,
    withCoords.reduce((s, l) => s + l.lng, 0) / withCoords.length,
  ]

  return (
    <div className="rounded-2xl overflow-hidden h-96 border border-gray-200">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((listing) => (
          <Marker key={listing.id} position={[listing.lat, listing.lng]} icon={icon}>
            <Popup>
              <div className="text-sm max-w-[200px]">
                <p className="font-semibold mb-1 leading-tight">{listing.title}</p>
                <p className="text-gray-500 mb-2">{listing.city}, {listing.country}</p>
                <p className="font-bold text-gray-900 mb-2">${listing.pricePerNight}/night</p>
                <button
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  className="w-full bg-gray-900 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View listing
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
