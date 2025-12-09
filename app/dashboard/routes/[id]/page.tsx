"use client"

import { use } from "react"
import { useRoute } from "@/lib/hooks"
import { useCustomers } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { RouteMap } from "@/components/route-map"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export default function RouteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: route, isLoading } = useRoute(id)
  const { data: customers } = useCustomers()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Route not found</p>
        <Button onClick={() => router.push("/dashboard/routes")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Routes
        </Button>
      </div>
    )
  }

  const routeCustomers = route.deliveries
    .map((delivery) => {
      const customer = customers?.find((c) => c.id === delivery.customerId)
      return customer ? { customer, delivery } : null
    })
    .filter(Boolean)
    .sort((a, b) => (a?.delivery.visitOrder || 0) - (b?.delivery.visitOrder || 0))

  const deliveredCount = route.deliveries.filter(
    (d) => d.status === "delivered"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/routes")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Routes
          </Button>
          <h1 className="text-2xl font-bold">Route Details</h1>
          <p className="text-gray-600">
            {route.salespersonName} • {format(new Date(route.date), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{route.deliveries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {route.deliveries.length - deliveredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteMap route={route} customers={routeCustomers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routeCustomers.map((item) => {
                if (!item) return null
                const { customer, delivery } = item
                return (
                  <div
                    key={customer.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/deliveries/${delivery.id}`)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-primary text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                            {delivery.visitOrder}
                          </span>
                          <h3 className="font-semibold">{customer.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {customer.address}
                        </p>
                        {delivery.deliveredAt && (
                          <p className="text-xs text-gray-500">
                            Delivered: {format(new Date(delivery.deliveredAt), "HH:mm")}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {delivery.status === "delivered" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

