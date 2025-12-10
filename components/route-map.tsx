"use client";

import { useActivityLogsByEmployeeAndDate } from "@/lib/hooks";
import type { ActivityLog, Customer, Delivery, Route } from "@/lib/mock-data";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapError } from "./map-error";

// Mapbox Directions API response types
interface DirectionsResponse {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
  }>;
  code: string;
  message?: string;
}

interface RouteMapProps {
  route: Route;
  customers: Array<{ customer: Customer; delivery: Delivery } | null>;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Fetch road route from Mapbox Directions API with multiple waypoints
// Uses full overview and steps for detailed navigation-like routing
async function fetchRoadRoute(
  waypoints: [number, number][],
  token: string
): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;

  try {
    // Build waypoints string: "lng1,lat1;lng2,lat2;lng3,lat3"
    const waypointsStr = waypoints.map((wp) => `${wp[0]},${wp[1]}`).join(";");
    // Use overview=full for detailed geometry and steps=true for navigation-like routing
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsStr}?geometries=geojson&overview=full&steps=true&access_token=${token}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Directions API error: ${response.statusText}`);
      return null;
    }

    const data: DirectionsResponse = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.warn(
        `Directions API returned no route: ${data.message || data.code}`
      );
      return null;
    }

    // Return the coordinates of the first route (full detailed geometry)
    return data.routes[0].geometry.coordinates;
  } catch (error) {
    console.warn("Error fetching road route:", error);
    return null;
  }
}

// Convert activity logs to road-following path using Mapbox Directions API
// Processes in smaller segments for detailed navigation-like routing
async function convertToRoadPath(
  activityLogs: ActivityLog[],
  token: string
): Promise<[number, number][]> {
  if (activityLogs.length === 0) return [];
  if (activityLogs.length === 1) {
    return [[activityLogs[0].longitude, activityLogs[0].latitude]];
  }

  // Strategy: Use more waypoints and process in smaller segments for Google Maps-like navigation
  // This ensures detailed routing that follows actual roads closely
  const MAX_WAYPOINTS_PER_REQUEST = 25; // Mapbox limit
  const SEGMENT_SIZE = 5; // Process 5 waypoints at a time for balance between detail and API calls
  const MIN_WAYPOINT_DISTANCE = 30; // Include waypoints at least 30m apart (more detailed)
  const allRoutes: [number, number][] = [];

  // Select waypoints: include all significant points and points that are reasonably spaced
  const waypoints: [number, number][] = [];

  // Always include first point
  waypoints.push([activityLogs[0].longitude, activityLogs[0].latitude]);

  // Include waypoints: significant events and points spaced apart
  for (let i = 1; i < activityLogs.length - 1; i++) {
    const current = activityLogs[i];

    // Check if this is a significant point
    const isSignificant =
      current.metadata?.is_at_customer ||
      current.metadata?.is_start ||
      current.metadata?.is_end ||
      current.eventName === "COMPLETE_DELIVERY";

    // Check distance from last waypoint
    if (waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const distanceFromLast = calculateDistance(
        lastWaypoint[1], // lat
        lastWaypoint[0], // lng
        current.latitude,
        current.longitude
      );

      // Include if significant or far enough apart
      if (isSignificant || distanceFromLast >= MIN_WAYPOINT_DISTANCE) {
        waypoints.push([current.longitude, current.latitude]);
      }
    } else {
      waypoints.push([current.longitude, current.latitude]);
    }
  }

  // Always include last point
  const lastLog = activityLogs[activityLogs.length - 1];
  const lastWaypoint: [number, number] = [lastLog.longitude, lastLog.latitude];
  if (
    waypoints.length === 0 ||
    waypoints[waypoints.length - 1][0] !== lastWaypoint[0] ||
    waypoints[waypoints.length - 1][1] !== lastWaypoint[1]
  ) {
    waypoints.push(lastWaypoint);
  }

  // If we have few waypoints, try to get route in one call
  if (waypoints.length <= MAX_WAYPOINTS_PER_REQUEST) {
    const route = await fetchRoadRoute(waypoints, token);
    if (route && route.length > 0) {
      return route;
    }
  }

  // Process waypoints in overlapping segments for smooth continuous routing
  // Each segment overlaps by 1 point to ensure continuity
  for (let i = 0; i < waypoints.length - 1; i += SEGMENT_SIZE - 1) {
    const segmentEnd = Math.min(i + SEGMENT_SIZE, waypoints.length);
    const segment = waypoints.slice(i, segmentEnd);

    if (segment.length < 2) continue;

    const route = await fetchRoadRoute(segment, token);

    if (route && route.length > 0) {
      // Merge routes, avoiding duplicate points at boundaries
      if (allRoutes.length > 0 && i > 0) {
        // Skip first point of subsequent segments (already included from previous segment)
        allRoutes.push(...route.slice(1));
      } else {
        allRoutes.push(...route);
      }
    } else {
      // Fallback: use straight line for this segment
      if (allRoutes.length > 0 && i > 0) {
        allRoutes.push(...segment.slice(1));
      } else {
        allRoutes.push(...segment);
      }
    }

    // Small delay to avoid rate limiting
    if (i + SEGMENT_SIZE < waypoints.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return allRoutes.length > 0
    ? allRoutes
    : activityLogs.map((log) => [log.longitude, log.latitude]);
}

export function RouteMap({ route, customers }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [roadPath, setRoadPath] = useState<[number, number][]>([]);
  const [isLoadingRoadPath, setIsLoadingRoadPath] = useState(false);

  // Fetch activity logs for this route
  const { data: activityLogs = [], isLoading: isLoadingLogs } =
    useActivityLogsByEmployeeAndDate(route.salespersonId, route.date);

  // Filter and sort activity logs by timestamp
  const sortedActivityLogs = useMemo(() => {
    return [...activityLogs].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [activityLogs]);

  // Convert activity logs to road-following path when logs are available
  useEffect(() => {
    if (sortedActivityLogs.length === 0) {
      setRoadPath([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      // Fallback to straight line if no token
      setRoadPath(
        sortedActivityLogs.map((log) => [log.longitude, log.latitude])
      );
      return;
    }

    setIsLoadingRoadPath(true);
    convertToRoadPath(sortedActivityLogs, token)
      .then((path) => {
        setRoadPath(path);
        setIsLoadingRoadPath(false);
      })
      .catch((error) => {
        console.error("Error converting to road path:", error);
        // Fallback to straight line on error
        setRoadPath(
          sortedActivityLogs.map((log) => [log.longitude, log.latitude])
        );
        setIsLoadingRoadPath(false);
      });
  }, [sortedActivityLogs]);

  // Check customer visit verification (proximity check)
  const customerVisitStatus = useMemo(() => {
    const status: Record<
      string,
      { verified: boolean; nearestDistance: number }
    > = {};
    const PROXIMITY_THRESHOLD = 200; // 200 meters

    customers.forEach((item) => {
      if (!item) return;
      const { customer } = item;
      let nearestDistance = Infinity;
      let verified = false;

      // Check all activity logs to find the nearest one to this customer
      sortedActivityLogs.forEach((log) => {
        const distance = calculateDistance(
          customer.latitude,
          customer.longitude,
          log.latitude,
          log.longitude
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
        }
        if (distance <= PROXIMITY_THRESHOLD) {
          verified = true;
        }
      });

      status[customer.id] = {
        verified,
        nearestDistance: Math.round(nearestDistance),
      };
    });

    return status;
  }, [customers, sortedActivityLogs]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMapError(
        "Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file and restart the dev server."
      );
      return;
    }

    // Validate that it's a public token (pk.*) not a secret token (sk.*)
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

    // Calculate center from customers
    const validCustomers = customers.filter(Boolean) as Array<{
      customer: Customer;
      delivery: Delivery;
    }>;

    if (validCustomers.length === 0) {
      // Don't initialize map if no customers, but don't show error either
      return;
    }

    const centerLat =
      validCustomers.reduce((sum, item) => sum + item.customer.latitude, 0) /
      validCustomers.length;
    const centerLng =
      validCustomers.reduce((sum, item) => sum + item.customer.longitude, 0) /
      validCustomers.length;

    console.log(
      "✅ Route map: Initializing with",
      validCustomers.length,
      "customers"
    );
    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [centerLng, centerLat],
        zoom: 12,
      });

      map.current.on("load", () => {
        console.log("✅ Route map: Loaded successfully");
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("❌ Route map error:", e);
        setMapError(
          `Mapbox error: ${
            e.error?.message || "Unknown error. Please check your token."
          }`
        );
      });
    } catch (error) {
      console.error("❌ Failed to initialize route map:", error);
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
  }, [customers]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const markers: mapboxgl.Marker[] = [];

    // Sort customers by visit order
    const sortedCustomers = [...customers]
      .filter(Boolean)
      .sort(
        (a, b) => (a?.delivery.visitOrder || 0) - (b?.delivery.visitOrder || 0)
      ) as Array<{ customer: Customer; delivery: Delivery }>;

    // Add activity log point markers (numbered travel points)
    if (sortedActivityLogs.length > 0) {
      // Show every Nth point to avoid clutter (show every 3rd point, or all if less than 20)
      const showEveryNth = sortedActivityLogs.length > 20 ? 3 : 1;
      sortedActivityLogs.forEach((log, logIndex) => {
        if (
          logIndex % showEveryNth !== 0 &&
          logIndex !== 0 &&
          logIndex !== sortedActivityLogs.length - 1
        ) {
          return; // Skip some intermediate points to reduce clutter
        }

        const sequenceNum = log.metadata?.sequence_number || logIndex + 1;
        const description = log.metadata?.description || "Location update";
        const isStart = log.metadata?.is_start;
        const isEnd = log.metadata?.is_end;
        const isAtCustomer = log.metadata?.is_at_customer;
        const isDelivery = log.eventName === "COMPLETE_DELIVERY";

        // Different marker styles based on point type
        let markerColor = "#3B82F6"; // Blue for travel points
        let markerSize = "w-3 h-3";
        let markerText = "";

        if (isStart) {
          markerColor = "#10B981"; // Green for start
          markerSize = "w-4 h-4";
          markerText = "S";
        } else if (isEnd) {
          markerColor = "#EF4444"; // Red for end
          markerSize = "w-4 h-4";
          markerText = "E";
        } else if (isDelivery) {
          markerColor = "#30D148"; // Green for delivery
          markerSize = "w-3.5 h-3.5";
          markerText = "✓";
        } else if (isAtCustomer) {
          markerColor = "#F59E0B"; // Orange for customer location
          markerSize = "w-3 h-3";
          markerText = sequenceNum.toString();
        } else {
          markerText = sequenceNum.toString();
        }

        const el = document.createElement("div");
        el.className = "activity-log-marker";
        el.innerHTML = `
          <div class="relative">
            <div class="bg-white rounded-full p-0.5 shadow-md border border-gray-300">
              <div class="${markerSize} rounded-full flex items-center justify-center text-[8px] font-bold" style="background-color: ${markerColor}; color: white">
                ${markerText}
              </div>
            </div>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([log.longitude, log.latitude])
          .setPopup(
            new mapboxgl.Popup({
              offset: 15,
              className: "custom-popup",
            }).setHTML(`
              <div class="p-3">
                <div class="text-xs">
                  <div class="font-semibold text-gray-800 mb-1">Point #${sequenceNum}</div>
                  <div class="text-gray-600 mb-1">${description}</div>
                  <div class="text-gray-500 text-[10px]">
                    ${new Date(log.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            `)
          )
          .addTo(map.current!);

        markers.push(marker);
      });
    }

    sortedCustomers.forEach((item, index) => {
      const { customer, delivery } = item;
      const visitStatus = customerVisitStatus[customer.id];
      const isVerified = visitStatus?.verified || false;
      const color = delivery.status === "delivered" ? "#30D148" : "#FFC107";
      const borderColor = isVerified ? "#1FA033" : color;

      const el = document.createElement("div");
      el.className = "customer-marker";
      el.innerHTML = `
        <div class="relative">
          <div class="bg-white rounded-full p-1 shadow-lg border-2" style="border-color: ${borderColor}; ${
        isVerified ? "border-width: 3px;" : ""
      }">
            <div class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: ${color}; color: white">
              ${index + 1}
            </div>
          </div>
          ${
            isVerified
              ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>'
              : ""
          }
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([customer.longitude, customer.latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setHTML(`
            <div class="p-4">
              <div class="flex items-start space-x-3 mb-3">
                <div class="rounded-lg p-2 flex items-center justify-center" style="background-color: ${color}20; min-width: 40px;">
                  <span class="text-sm font-bold" style="color: ${color};">
                    #${index + 1}
                  </span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 text-base mb-2">${
                    customer.name
                  }</h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style="background-color: ${color}20; color: ${color};">
                      ${
                        delivery.status === "delivered"
                          ? "✓ Delivered"
                          : "⏱ Pending"
                      }
                    </span>
                    ${
                      isVerified
                        ? `
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ Verified Visit
                      </span>
                    `
                        : visitStatus
                        ? `
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        ⚠ No visit detected (${visitStatus.nearestDistance}m away)
                      </span>
                    `
                        : ""
                    }
                  </div>
                  <div class="text-xs text-gray-600 mb-2">
                    <span class="font-medium">Visit Order:</span> #${
                      delivery.visitOrder
                    }
                  </div>
                  ${
                    customer.address
                      ? `
                    <div class="text-xs text-gray-500 line-clamp-2">
                      ${customer.address}
                    </div>
                  `
                      : ""
                  }
                  ${
                    delivery.deliveredAt
                      ? `
                    <div class="mt-2 text-xs text-gray-500">
                      Delivered at: ${new Date(
                        delivery.deliveredAt
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      markers.push(marker);
    });

    // Draw actual travel path following roads (if available) or fallback to activity log points
    if (roadPath.length > 0) {
      if (map.current.getSource("actual-route")) {
        (
          map.current.getSource("actual-route") as mapboxgl.GeoJSONSource
        ).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: roadPath,
          },
        });
      } else {
        map.current.addLayer({
          id: "actual-route",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: roadPath,
              },
            },
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3B82F6",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    } else if (sortedActivityLogs.length > 0) {
      // Fallback: use straight lines between activity log points if road path not available
      const activityCoordinates = sortedActivityLogs.map((log) => [
        log.longitude,
        log.latitude,
      ]) as [number, number][];

      if (map.current.getSource("actual-route")) {
        (
          map.current.getSource("actual-route") as mapboxgl.GeoJSONSource
        ).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: activityCoordinates,
          },
        });
      } else {
        map.current.addLayer({
          id: "actual-route",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: activityCoordinates,
              },
            },
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3B82F6",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    } else {
      // Remove actual route if no activity logs
      if (map.current.getLayer("actual-route")) {
        map.current.removeLayer("actual-route");
      }
      if (map.current.getSource("actual-route")) {
        map.current.removeSource("actual-route");
      }
    }

    // Draw planned route line (straight lines between customers) as fallback/reference
    if (sortedCustomers.length > 1) {
      const coordinates = sortedCustomers.map((item) => [
        item.customer.longitude,
        item.customer.latitude,
      ]) as [number, number][];

      if (map.current.getSource("planned-route")) {
        (
          map.current.getSource("planned-route") as mapboxgl.GeoJSONSource
        ).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        });
      } else {
        map.current.addLayer({
          id: "planned-route",
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
            "line-color": sortedActivityLogs.length > 0 ? "#1FA033" : "#1FA033",
            "line-width": sortedActivityLogs.length > 0 ? 2 : 3,
            "line-opacity": sortedActivityLogs.length > 0 ? 0.4 : 1,
          },
        });
      }
    } else {
      // Remove planned route line if less than 2 customers
      if (map.current.getLayer("planned-route")) {
        map.current.removeLayer("planned-route");
      }
      if (map.current.getSource("planned-route")) {
        map.current.removeSource("planned-route");
      }
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      if (map.current) {
        if (map.current.getLayer("actual-route")) {
          map.current.removeLayer("actual-route");
        }
        if (map.current.getSource("actual-route")) {
          map.current.removeSource("actual-route");
        }
        if (map.current.getLayer("planned-route")) {
          map.current.removeLayer("planned-route");
        }
        if (map.current.getSource("planned-route")) {
          map.current.removeSource("planned-route");
        }
      }
    };
  }, [mapLoaded, customers, sortedActivityLogs, customerVisitStatus, roadPath]);

  const validCustomers = customers.filter(Boolean) as Array<{
    customer: Customer;
    delivery: Delivery;
  }>;

  if (mapError) {
    return <MapError message={mapError} />;
  }

  if (validCustomers.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">No customers in this route</p>
      </div>
    );
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
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
}
