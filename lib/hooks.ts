import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "./api"
import type { Employee, Customer, Route, Delivery } from "./mock-data"

// Employees
export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: api.getEmployees,
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.getEmployee(id),
    enabled: !!id,
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      api.updateEmployee(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })
}

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: api.getCustomers,
  })
}

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.getCustomer(id),
    enabled: !!id,
  })
}

// Routes
export const useRoutes = () => {
  return useQuery({
    queryKey: ["routes"],
    queryFn: api.getRoutes,
  })
}

export const useRoute = (id: string) => {
  return useQuery({
    queryKey: ["route", id],
    queryFn: () => api.getRoute(id),
    enabled: !!id,
  })
}

export const useRoutesByDate = (date: string) => {
  return useQuery({
    queryKey: ["routes", date],
    queryFn: () => api.getRoutesByDate(date),
    enabled: !!date,
  })
}

export const useCreateRoute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
    },
  })
}

// Deliveries
export const useDelivery = (id: string) => {
  return useQuery({
    queryKey: ["delivery", id],
    queryFn: () => api.getDelivery(id),
    enabled: !!id,
  })
}

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      routeId,
      deliveryId,
      updates,
    }: {
      routeId: string
      deliveryId: string
      updates: Partial<Delivery>
    }) => api.updateDelivery(routeId, deliveryId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route", variables.routeId] })
      queryClient.invalidateQueries({ queryKey: ["routes"] })
    },
  })
}

// Attendances
export const useAttendances = (date?: string) => {
  return useQuery({
    queryKey: ["attendances", date],
    queryFn: () => api.getAttendances(date),
  })
}

