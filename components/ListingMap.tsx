'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface ListingMapProps {
  lat: number
  lng: number
  title: string
  address: string
}

export default function ListingMap({ lat, lng, title, address }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up any existing Leaflet instance on this container
    if ((containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      mapRef.current?.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 14)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${title}</strong><br />${address}`)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, title, address])

  return (
    <div className="rounded-2xl overflow-hidden h-64 border border-border isolate">
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}
