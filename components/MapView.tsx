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
  const LRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const L = require('leaflet')
    LRef.current = L

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

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // Update markers reactively when listings change
  useEffect(() => {
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    const validListings = listings.filter(l => l.lat && l.lng)

    // Remove markers no longer in listings
    const currentIds = new Set(validListings.map(l => l.id))
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add new markers
    validListings.forEach(listing => {
      if (markersRef.current.has(listing.id)) return
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

    // Fit bounds to all markers
    if (validListings.length > 0) {
      const bounds = L.latLngBounds(validListings.map(l => [l.lat, l.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    } else {
      map.setView([20, 0], 2)
    }
  }, [listings])

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
