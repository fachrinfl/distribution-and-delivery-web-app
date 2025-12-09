"use client"

import { useState } from "react"
import { useRoutes, useCreateRoute } from "@/lib/hooks"
import { useCustomers } from "@/lib/hooks"
import { useEmployees } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Plus, ArrowRight, Package, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { mockEmployees } from "@/lib/mock-data"

export default function RoutesPage() {
  const router = useRouter()
  const { data: routes, isLoading } = useRoutes()
  const { data: customers } = useCustomers()
  const { data: employees } = useEmployees()
  const createRoute = useCreateRoute()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    salespersonId: "",
    customerIds: [] as string[],
  })

  const handleOpenDialog = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      salespersonId: "",
      customerIds: [],
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      date: new Date().toISOString().split("T")[0],
      salespersonId: "",
      customerIds: [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.salespersonId || formData.customerIds.length === 0) {
      setAlertOpen(true)
      return
    }

    try {
      await createRoute.mutateAsync({
        date: formData.date,
        salespersonId: formData.salespersonId,
        customerIds: formData.customerIds,
        salespersonName: "",
      })
      handleCloseDialog()
    } catch (error) {
      console.error("Error creating route:", error)
    }
  }

  const toggleCustomer = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      customerIds: prev.customerIds.includes(customerId)
        ? prev.customerIds.filter((id) => id !== customerId)
        : [...prev.customerIds, customerId],
    }))
  }

  const salesEmployees = employees?.filter((e) => e.role === "sales" && e.isActive) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Route Management</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Route Management</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Route
        </Button>
      </div>

      <div className="space-y-4">
        {routes?.map((route) => {
          const deliveredCount = route.deliveries.filter(
            (d) => d.status === "delivered"
          ).length
          const totalCount = route.deliveries.length

          return (
            <Card
              key={route.id}
              className="cursor-pointer card-hover group border-l-4 border-l-primary"
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-3 shadow-sm">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {route.salespersonName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(route.date), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Progress</p>
                      <p className="text-xl font-bold text-gray-900">
                        {deliveredCount}/{totalCount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Customers</p>
                      <p className="text-xl font-bold text-gray-900">{totalCount}</p>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:border-primary group-hover:text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Delivery Progress</span>
                    <span className="font-medium text-gray-700">{Math.round((deliveredCount / totalCount) * 100)}%</span>
                  </div>
                  <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        deliveredCount === totalCount
                          ? "bg-gradient-to-r from-success to-success/80"
                          : "bg-gradient-to-r from-primary to-primary-dark"
                      }`}
                      style={{
                        width: `${(deliveredCount / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {routes?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No routes created yet</p>
            <Button onClick={handleOpenDialog} className="mt-4">
              Create Your First Route
            </Button>
          </CardContent>
        </Card>
      )}

      <Drawer open={dialogOpen} onOpenChange={setDialogOpen} direction="right">
        <DrawerContent onClose={handleCloseDialog}>
          <DrawerHeader>
            <DrawerTitle>Create New Route</DrawerTitle>
            <DrawerDescription>
              Assign customers to a salesperson for a specific date
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="px-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesperson">Salesperson</Label>
                <Select
                  value={formData.salespersonId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salespersonId: value })
                  }
                  required
                >
                  <SelectTrigger id="salesperson">
                    <SelectValue placeholder="Select a salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customers (Select multiple)</Label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {customers?.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.customerIds.includes(customer.id)}
                        onCheckedChange={() => toggleCustomer(customer.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.address}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Selected: {formData.customerIds.length} customer(s)
                </p>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Route
                </Button>
              </div>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validation Error</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a salesperson and at least one customer to create a route.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

