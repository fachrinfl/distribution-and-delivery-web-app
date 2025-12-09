"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAttendances,
  useCustomers,
  useEmployees,
  useRoutes,
} from "@/lib/hooks";
import { format } from "date-fns";
import { Clock, MapPin, Package, Users } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IndonesiaCoverageMap } from "./indonesia-coverage-map";
import { MapError } from "./map-error";

export function MapDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { data: routes } = useRoutes();
  const { data: attendances } = useAttendances();
  const { data: employees } = useEmployees();
  const { data: customers } = useCustomers();
  const router = useRouter();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Debug: Check if token is available
    if (!token) {
      console.error("❌ NEXT_PUBLIC_MAPBOX_TOKEN is not set");
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

    console.log("✅ Mapbox token found, initializing map...");
    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [106.8456, -6.2088], // Jakarta
        zoom: 12,
      });

      map.current.on("load", () => {
        console.log("✅ Mapbox map loaded successfully");
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("❌ Mapbox error:", e);
        setMapError(
          `Mapbox error: ${
            e.error?.message || "Unknown error. Please check your token."
          }`
        );
      });
    } catch (error) {
      console.error("❌ Failed to initialize Mapbox:", error);
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

  useEffect(() => {
    if (
      !map.current ||
      !mapLoaded ||
      !routes ||
      !attendances ||
      !employees ||
      !customers
    )
      return;

    const currentMap = map.current;
    // Clear existing markers
    const markers: mapboxgl.Marker[] = [];

    // Add sales markers
    attendances.forEach((attendance) => {
      if (!attendance.clockIn) return;

      const employee = employees.find((e) => e.id === attendance.employeeId);
      if (!employee) return;

      const route = routes.find((r) => r.salespersonId === employee.id);
      const deliveredCount =
        route?.deliveries.filter((d) => d.status === "delivered").length || 0;
      const totalCount = route?.deliveries.length || 0;

      const el = document.createElement("div");
      el.className = "sales-marker";
      el.innerHTML = `
        <div class="bg-primary text-white rounded-full p-2 shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([attendance.clockIn.longitude, attendance.clockIn.latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setHTML(`
            <div class="p-4">
              <div class="flex items-start space-x-3 mb-3">
                <div class="bg-primary/10 rounded-lg p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                    <circle cx="12" cy="9" r="2.5"></circle>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800 text-base mb-1">${
                    employee.name
                  }</h3>
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                      On Duty
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Progress:</span>
                    <span class="font-semibold text-gray-800">${deliveredCount}/${totalCount}</span>
                  </div>
                </div>
              </div>
              ${
                route
                  ? `
                <button 
                  class="w-full mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors" 
                  data-route-id="${route.id}"
                  onclick="window.location.href='/dashboard/routes/${route.id}'"
                >
                  View Route
                </button>
              `
                  : ""
              }
            </div>
          `)
        )
        .addTo(currentMap);

      markers.push(marker);
    });

    // Add customer markers
    routes?.forEach((route) => {
      route.deliveries.forEach((delivery) => {
        const customer = customers.find((c) => c.id === delivery.customerId);
        if (!customer) return;

        const color = delivery.status === "delivered" ? "#30D148" : "#FFC107";
        const el = document.createElement("div");
        el.className = "customer-marker";
        el.innerHTML = `
          <div class="bg-white rounded-full p-1 shadow-lg border-2" style="border-color: ${color}">
            <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
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
                <div class="rounded-lg p-2" style="background-color: ${color}20;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: ${color};">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
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
                  </div>
                  <div class="text-xs text-gray-600">
                    <span class="font-medium">Visit Order:</span> #${
                      delivery.visitOrder
                    }
                  </div>
                  ${
                    customer.address
                      ? `
                    <div class="mt-2 text-xs text-gray-500 line-clamp-2">
                      ${customer.address}
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          `)
          )
          .addTo(currentMap);

        markers.push(marker);
      });
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [mapLoaded, routes, attendances, employees, customers, router]);

  const activeSales =
    attendances?.filter((a) => a.clockIn && !a.clockOut) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Active Sales
            </CardTitle>
            <div className="bg-primary/10 rounded-lg p-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {activeSales.length}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Currently on duty
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Routes
            </CardTitle>
            <div className="bg-primary/10 rounded-lg p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {routes?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Today's routes</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Deliveries
            </CardTitle>
            <div className="bg-success/10 rounded-lg p-2">
              <Clock className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {routes?.reduce(
                (acc, r) =>
                  acc +
                  r.deliveries.filter((d) => d.status === "delivered").length,
                0
              ) || 0}
            </div>
            <p className="text-xs text-gray-500">Completed today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Real-Time Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapError ? (
            <MapError message={mapError} />
          ) : (
            <div className="relative w-full h-[600px]">
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
        </CardContent>
      </Card>

      <IndonesiaCoverageMap />

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Users className="h-4 w-4 text-white" />
            </div>
            Active Sales List
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {activeSales.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  No active sales at the moment
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Sales will appear here when they clock in
                </p>
              </div>
            ) : (
              activeSales.map((attendance) => {
                const employee = employees?.find(
                  (e) => e.id === attendance.employeeId
                );
                const route = routes?.find(
                  (r) => r.salespersonId === attendance.employeeId
                );
                if (!employee || !attendance.clockIn) return null;

                const deliveredCount =
                  route?.deliveries.filter((d) => d.status === "delivered")
                    .length || 0;
                const totalCount = route?.deliveries.length || 0;
                const progress =
                  totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0;

                return (
                  <div
                    key={attendance.id}
                    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-full p-3 shadow-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse"></span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {employee.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Clocked in:{" "}
                            {format(new Date(attendance.clockIn.time), "HH:mm")}
                          </p>
                        </div>
                        {route && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span className="font-medium text-gray-700">
                                {deliveredCount}/{totalCount}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {route && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/routes/${route.id}`)
                        }
                        className="ml-4 group-hover:border-primary group-hover:text-primary"
                      >
                        View Route
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
