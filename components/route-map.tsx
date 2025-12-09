"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Route, Customer, Delivery } from "@/lib/mock-data"
import { MapError } from "./map-error"

interface RouteMapProps {
  route: Route
  customers: Array<{ customer: Customer; delivery: Delivery } | null>
}

export function RouteMap({ route, customers }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      setMapError("Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file and restart the dev server.")
      return
    }

    // Validate that it's a public token (pk.*) not a secret token (sk.*)
    if (token.startsWith("sk.")) {
      setMapError(
        "You're using a SECRET token (sk.*). Mapbox GL requires a PUBLIC token (pk.*). " +
        "Secret tokens are for server-side use only and will cause errors in the browser."
      )
      return
    }

    if (!token.startsWith("pk.")) {
      setMapError("Invalid Mapbox token format. Token should start with 'pk.' (public token)")
      return
    }

    // Calculate center from customers
    const validCustomers = customers.filter(Boolean) as Array<{
      customer: Customer
      delivery: Delivery
    }>
    
    if (validCustomers.length === 0) {
      // Don't initialize map if no customers, but don't show error either
      return
    }

    const centerLat =
      validCustomers.reduce((sum, item) => sum + item.customer.latitude, 0) /
      validCustomers.length
    const centerLng =
      validCustomers.reduce((sum, item) => sum + item.customer.longitude, 0) /
      validCustomers.length

    console.log("✅ Route map: Initializing with", validCustomers.length, "customers")
    mapboxgl.accessToken = token

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [centerLng, centerLat],
        zoom: 12,
      })

      map.current.on("load", () => {
        console.log("✅ Route map: Loaded successfully")
        setMapLoaded(true)
      })

      map.current.on("error", (e) => {
        console.error("❌ Route map error:", e)
        setMapError(
          `Mapbox error: ${e.error?.message || "Unknown error. Please check your token."}`
        )
      })
    } catch (error) {
      console.error("❌ Failed to initialize route map:", error)
      setMapError(
        `Failed to initialize map: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [customers])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const markers: mapboxgl.Marker[] = []

    // Sort customers by visit order
    const sortedCustomers = [...customers]
      .filter(Boolean)
      .sort(
        (a, b) =>
          (a?.delivery.visitOrder || 0) - (b?.delivery.visitOrder || 0)
      ) as Array<{ customer: Customer; delivery: Delivery }>

    sortedCustomers.forEach((item, index) => {
      const { customer, delivery } = item
      const color = delivery.status === "delivered" ? "#30D148" : "#FFC107"

      const el = document.createElement("div")
      el.className = "customer-marker"
      el.innerHTML = `
        <div class="relative">
          <div class="bg-white rounded-full p-1 shadow-lg border-2" style="border-color: ${color}">
            <div class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: ${color}; color: white">
              ${index + 1}
            </div>
          </div>
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([customer.longitude, customer.latitude])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: 'custom-popup'
          }).setHTML(`
            <div class="p-4">
              <div class="flex items-start space-x-3 mb-3">
                <div class="rounded-lg p-2 flex items-center justify-center" style="background-color: ${color}20; min-width: 40px;">
                  <span class="text-sm font-bold" style="color: ${color};">
                    #${index + 1}
                  </span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 text-base mb-2">${customer.name}</h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style="background-color: ${color}20; color: ${color};">
                      ${delivery.status === "delivered" ? "✓ Delivered" : "⏱ Pending"}
                    </span>
                  </div>
                  <div class="text-xs text-gray-600 mb-2">
                    <span class="font-medium">Visit Order:</span> #${delivery.visitOrder}
                  </div>
                  ${customer.address ? `
                    <div class="text-xs text-gray-500 line-clamp-2">
                      ${customer.address}
                    </div>
                  ` : ''}
                  ${delivery.deliveredAt ? `
                    <div class="mt-2 text-xs text-gray-500">
                      Delivered at: ${new Date(delivery.deliveredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `)
        )
        .addTo(map.current!)

      markers.push(marker)
    })

    // Draw route line if we have multiple customers
    if (sortedCustomers.length > 1) {
      const coordinates = sortedCustomers.map((item) => [
        item.customer.longitude,
        item.customer.latitude,
      ]) as [number, number][]

      if (map.current.getSource("route")) {
        ;(map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        })
      } else {
        map.current.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#1FA033",
            "line-width": 3,
          },
        })
      }
    } else {
      // Remove route line if less than 2 customers
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route")
      }
    }

    return () => {
      markers.forEach((marker) => marker.remove())
      if (map.current) {
        if (map.current.getLayer("route")) {
          map.current.removeLayer("route")
        }
        if (map.current.getSource("route")) {
          map.current.removeSource("route")
        }
      }
    }
  }, [mapLoaded, customers])

  const validCustomers = customers.filter(Boolean) as Array<{
    customer: Customer
    delivery: Delivery
  }>

  if (mapError) {
    return <MapError message={mapError} />
  }

  if (validCustomers.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">No customers in this route</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px]">
      {!mapLoaded && (
        <div className="absolute inset-0 rounded-lg bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
      />
    </div>
  )
}

