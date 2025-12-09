"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { CheckCircle, MapPin, XCircle } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { MapError } from "./map-error";

type IndonesianRegion = {
  name: string;
  shortName: string;
  color: string;
  coordinates: { x: number; y: number; width: number; height: number };
};

// Indonesia regions with center coordinates for map markers
const indonesianRegions: (IndonesianRegion & {
  centerLat: number;
  centerLng: number;
})[] = [
  {
    name: "Sumatra",
    shortName: "Sumatra",
    color: "#1FA033",
    coordinates: { x: 5, y: 15, width: 25, height: 35 },
    centerLat: 0.7893,
    centerLng: 101.3431,
  },
  {
    name: "Java",
    shortName: "Java",
    color: "#1FA033",
    coordinates: { x: 32, y: 50, width: 12, height: 20 },
    centerLat: -7.4917,
    centerLng: 110.0044,
  },
  {
    name: "Kalimantan",
    shortName: "Kalimantan",
    color: "#D1D5DB",
    coordinates: { x: 20, y: 20, width: 20, height: 25 },
    centerLat: -0.7893,
    centerLng: 113.9213,
  },
  {
    name: "Sulawesi",
    shortName: "Sulawesi",
    color: "#D1D5DB",
    coordinates: { x: 45, y: 30, width: 12, height: 25 },
    centerLat: -2.5489,
    centerLng: 121.0,
  },
  {
    name: "Papua",
    shortName: "Papua",
    color: "#D1D5DB",
    coordinates: { x: 60, y: 10, width: 15, height: 40 },
    centerLat: -4.2699,
    centerLng: 138.0804,
  },
  {
    name: "Bali & Nusa Tenggara",
    shortName: "Bali & NT",
    color: "#D1D5DB",
    coordinates: { x: 40, y: 55, width: 8, height: 15 },
    centerLat: -8.4095,
    centerLng: 115.1889,
  },
  {
    name: "Maluku",
    shortName: "Maluku",
    color: "#D1D5DB",
    coordinates: { x: 50, y: 25, width: 8, height: 12 },
    centerLat: -3.2389,
    centerLng: 130.1453,
  },
];

// Function to determine region from coordinates
function getRegionFromCoordinates(latitude: number, longitude: number): string {
  // Java: -6 to -8 lat, 105 to 114 lon
  if (
    latitude >= -8.5 &&
    latitude <= -5.5 &&
    longitude >= 105 &&
    longitude <= 114.5
  ) {
    return "Java";
  }
  // Sumatra: 0 to 6 lat, 95 to 106 lon
  if (
    latitude >= -0.5 &&
    latitude <= 6 &&
    longitude >= 95 &&
    longitude <= 106
  ) {
    return "Sumatra";
  }
  // Kalimantan: -4 to 7 lat, 108 to 119 lon
  if (latitude >= -4 && latitude <= 7 && longitude >= 108 && longitude <= 119) {
    return "Kalimantan";
  }
  // Sulawesi: -6 to 2 lat, 118 to 125 lon
  if (latitude >= -6 && latitude <= 2 && longitude >= 118 && longitude <= 125) {
    return "Sulawesi";
  }
  // Papua: -11 to 0 lat, 130 to 141 lon
  if (
    latitude >= -11 &&
    latitude <= 0 &&
    longitude >= 130 &&
    longitude <= 141
  ) {
    return "Papua";
  }
  // Bali & Nusa Tenggara: -9 to -8 lat, 114 to 125 lon
  if (
    latitude >= -9.5 &&
    latitude <= -7.5 &&
    longitude >= 114 &&
    longitude <= 125
  ) {
    return "Bali & Nusa Tenggara";
  }
  // Maluku: -6 to 2 lat, 125 to 130 lon
  if (latitude >= -6 && latitude <= 2 && longitude >= 125 && longitude <= 130) {
    return "Maluku";
  }
  return "Unknown";
}

export function IndonesiaCoverageMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { data: customers } = useCustomers();

  // Group customers by region
  const regionStats = indonesianRegions.map((region) => {
    const customersInRegion =
      customers?.filter((customer) => {
        const customerRegion = getRegionFromCoordinates(
          customer.latitude,
          customer.longitude
        );
        return customerRegion === region.name;
      }) || [];

    return {
      ...region,
      count: customersInRegion.length,
      isCovered: customersInRegion.length > 0,
    };
  });

  const totalCovered = regionStats.filter((r) => r.isCovered).length;
  const totalRegions = indonesianRegions.length;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMapError(
        "Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file and restart the dev server."
      );
      return;
    }

    if (token.startsWith("sk.")) {
      setMapError(
        "You're using a SECRET token (sk.*). Mapbox GL requires a PUBLIC token (pk.*). " +
          "Secret tokens are for server-side use only and will cause errors in the browser."
      );
      return;
    }

    if (!token.startsWith("pk.")) {
      setMapError(
        "Invalid Mapbox token format. Token should start with 'pk.' (public token)"
      );
      return;
    }

    mapboxgl.accessToken = token;

    try {
      // Center on Indonesia
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [118.0, -2.0], // Center of Indonesia
        zoom: 4.5,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("❌ Indonesia map error:", e);
        setMapError(
          `Mapbox error: ${
            e.error?.message || "Unknown error. Please check your token."
          }`
        );
      });
    } catch (error) {
      console.error("❌ Failed to initialize Indonesia map:", error);
      setMapError(
        `Failed to initialize map: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add regional markers with popovers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentMap = map.current;
    const markers: mapboxgl.Marker[] = [];

    regionStats.forEach((region) => {
      const color = region.isCovered ? "#1FA033" : "#D1D5DB";

      const el = document.createElement("div");
      el.className = "region-marker";
      el.innerHTML = `
        <div class="bg-white rounded-full p-2 shadow-lg border-2" style="border-color: ${color};">
          <div class="w-4 h-4 rounded-full" style="background-color: ${color};"></div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([region.centerLng, region.centerLat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setHTML(`
            <div class="p-4">
              <div class="flex items-start space-x-3 mb-3">
                <div class="rounded-lg p-2 flex-shrink-0" style="background-color: ${color}20;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: ${color};">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 text-base mb-2">${
                    region.name
                  }</h3>
                  ${
                    region.isCovered
                      ? `<div class="flex items-center space-x-2 mb-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        Covered
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      <span class="font-medium">Points:</span> <span class="font-semibold text-primary">${region.count}</span>
                    </div>`
                      : `<div class="flex items-center space-x-2 mb-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        Not Covered
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      No active points in this region
                    </div>`
                  }
                </div>
              </div>
            </div>
          `)
        )
        .addTo(currentMap);

      markers.push(marker);
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [mapLoaded, regionStats]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Regional Coverage
          </CardTitle>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-900">
              {totalCovered}
            </span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-600">{totalRegions}</span>
            <span className="text-xs text-gray-500 ml-1">regions</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Indonesia Map with Regional Markers */}
          {mapError ? (
            <MapError message={mapError} />
          ) : (
            <div className="relative w-full h-[400px]">
              {!mapLoaded && (
                <div className="absolute inset-0 rounded-lg bg-gray-100 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
              <div ref={mapContainer} className="w-full h-full rounded-lg" />
            </div>
          )}

          {/* Regional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regionStats.map((region) => (
              <div
                key={region.name}
                className={cn(
                  "group p-4 rounded-xl border-2 transition-all duration-200 card-hover",
                  region.isCovered
                    ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:border-primary/50"
                    : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {region.shortName}
                  </h4>
                  {region.isCovered ? (
                    <div className="bg-success/10 rounded-full p-1.5">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-full p-1.5">
                      <XCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {region.isCovered ? (
                    <>
                      <div className="bg-primary/10 rounded-lg p-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {region.count} point{region.count !== 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">
                      Not yet covered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-700 font-medium">
                Coverage Summary
              </span>
              <span className="font-bold text-gray-900">
                {totalCovered} of {totalRegions} regions active
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 rounded-full"
                style={{ width: `${(totalCovered / totalRegions) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">
                  {Math.round((totalCovered / totalRegions) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
