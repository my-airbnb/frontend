'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { Listing } from '@/types'

interface MapViewProps {
  listings: Listing[]
  hoveredId?: string | null
}

export default function MapView({ listings, hoveredId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Dynamic import to avoid SSR issues (this component is loaded via next/dynamic ssr:false)
    const L = require('leaflet')

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    const validListings = listings.filter(l => l.lat && l.lng)
    if (validListings.length === 0) {
      map.setView([20, 0], 2)
    } else {
      validListings.forEach(listing => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="map-price-pin">€${Math.round(listing.pricePerNight)}</div>`,
          iconAnchor: [28, 16],
        })

        const marker = L.marker([listing.lat, listing.lng], { icon })
        marker.addTo(map)
        marker.bindPopup(`
          <div style="min-width:160px">
            <img src="${listing.photos?.[0] ?? ''}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:6px" />
            <div style="font-weight:600;font-size:13px;line-height:1.3">${listing.title}</div>
            <div style="color:#666;font-size:12px;margin-top:2px">€${listing.pricePerNight}/night</div>
          </div>
        `, { maxWidth: 200 })
        markersRef.current.set(listing.id, marker)
      })

      const bounds = L.latLngBounds(validListings.map(l => [l.lat, l.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Highlight hovered marker
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()?.querySelector('.map-price-pin')
      if (!el) return
      if (id === hoveredId) {
        el.setAttribute('data-hovered', 'true')
      } else {
        el.removeAttribute('data-hovered')
      }
    })
  }, [hoveredId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
