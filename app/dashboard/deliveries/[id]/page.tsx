"use client"

import { use } from "react"
import { useDelivery } from "@/lib/hooks"
import { useCustomer } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, CheckCircle, FileText } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export default function DeliveryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: delivery, isLoading } = useDelivery(id)
  const { data: customer } = useCustomer(delivery?.customerId || "")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!delivery || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Delivery not found</p>
        <Button onClick={() => router.push("/dashboard/routes")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Routes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Delivery Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{customer.name}</h3>
              <div className="flex items-start space-x-2 text-gray-600">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <p>{customer.address}</p>
              </div>
              {customer.phone && (
                <p className="text-sm text-gray-600 mt-2">Phone: {customer.phone}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Visit Order</span>
                <span className="font-semibold">#{delivery.visitOrder}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Status</span>
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
              {delivery.deliveredAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delivered At</span>
                  <span className="text-sm font-medium">
                    {format(new Date(delivery.deliveredAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {delivery.status === "delivered" && (
          <Card>
            <CardHeader>
              <CardTitle>Proof of Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {delivery.proofPhoto && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={delivery.proofPhoto}
                    alt="Proof of delivery"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {delivery.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-gray-600">{delivery.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              {delivery.deliveredLatitude && delivery.deliveredLongitude && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium mb-1">Delivery Location</p>
                      <p className="text-xs text-gray-600">
                        {delivery.deliveredLatitude.toFixed(6)},{" "}
                        {delivery.deliveredLongitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {delivery.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
                <p className="text-gray-600">This delivery is still pending</p>
                <p className="text-sm text-gray-500 mt-2">
                  Waiting for the salesperson to complete the delivery
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

