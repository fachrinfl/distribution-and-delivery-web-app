import { supabase } from "./supabase/client"
import type {
  Employee,
  Customer,
  Route,
  Delivery,
  Attendance,
  ActivityLog,
} from "./mock-data"

export const api = {
  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data || []).map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role as "admin" | "sales",
      isActive: e.is_active,
      createdAt: e.created_at,
    }))
  },

  getEmployee: async (id: string): Promise<Employee | undefined> => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return undefined
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as "admin" | "sales",
      isActive: data.is_active,
      createdAt: data.created_at,
    }
  },

  createEmployee: async (
    employee: Omit<Employee, "id" | "createdAt">
  ): Promise<Employee> => {
    const { data, error } = await supabase
      .from("employees")
      .insert({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        is_active: employee.isActive,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as "admin" | "sales",
      isActive: data.is_active,
      createdAt: data.created_at,
    }
  },

  updateEmployee: async (
    id: string,
    updates: Partial<Employee>
  ): Promise<Employee> => {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as "admin" | "sales",
      isActive: data.is_active,
      createdAt: data.created_at,
    }
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from("customers")
      .select("*, regions(name)")
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      phone: c.phone || undefined,
      region: c.regions?.name || "Unknown",
    }))
  },

  getCustomer: async (id: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
      .from("customers")
      .select("*, regions(name)")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return undefined
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      phone: data.phone || undefined,
      region: (data as any).regions?.name || "Unknown",
    }
  },

  // Routes
  getRoutes: async (): Promise<Route[]> => {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        employees!routes_salesperson_id_fkey(name),
        route_customers(customer_id),
        deliveries(*)
      `
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((r: any) => {
      const salesperson = Array.isArray(r.employees) ? r.employees[0] : r.employees
      const routeCustomers = r.route_customers || []
      const deliveries = (r.deliveries || []).map((d: any) => ({
        id: d.id,
        customerId: d.customer_id,
        routeId: d.route_id,
        status: d.status as "pending" | "delivered",
        visitOrder: d.visit_order,
        proofPhoto: d.proof_photo || undefined,
        notes: d.notes || undefined,
        deliveredAt: d.delivered_at || undefined,
        deliveredLatitude: d.delivered_latitude ? Number(d.delivered_latitude) : undefined,
        deliveredLongitude: d.delivered_longitude ? Number(d.delivered_longitude) : undefined,
      }))

      return {
        id: r.id,
        date: r.date,
        salespersonId: r.salesperson_id,
        salespersonName: salesperson?.name || "Unknown",
        customerIds: routeCustomers.map((rc: any) => rc.customer_id),
        deliveries,
        createdAt: r.created_at,
      }
    })
  },

  getRoute: async (id: string): Promise<Route | undefined> => {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        employees!routes_salesperson_id_fkey(name),
        route_customers(customer_id),
        deliveries(*)
      `
      )
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return undefined
      throw error
    }

    const salesperson = Array.isArray(data.employees) ? data.employees[0] : data.employees
    const routeCustomers = data.route_customers || []
    const deliveries = (data.deliveries || []).map((d: any) => ({
      id: d.id,
      customerId: d.customer_id,
      routeId: d.route_id,
      status: d.status as "pending" | "delivered",
      visitOrder: d.visit_order,
      proofPhoto: d.proof_photo || undefined,
      notes: d.notes || undefined,
      deliveredAt: d.delivered_at || undefined,
      deliveredLatitude: d.delivered_latitude ? Number(d.delivered_latitude) : undefined,
      deliveredLongitude: d.delivered_longitude ? Number(d.delivered_longitude) : undefined,
    }))

    return {
      id: data.id,
      date: data.date,
      salespersonId: data.salesperson_id,
      salespersonName: salesperson?.name || "Unknown",
      customerIds: routeCustomers.map((rc: any) => rc.customer_id),
      deliveries,
      createdAt: data.created_at,
    }
  },

  getRoutesByDate: async (date: string): Promise<Route[]> => {
    const { data, error } = await supabase
      .from("routes")
      .select(
        `
        *,
        employees!routes_salesperson_id_fkey(name),
        route_customers(customer_id),
        deliveries(*)
      `
      )
      .eq("date", date)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((r: any) => {
      const salesperson = Array.isArray(r.employees) ? r.employees[0] : r.employees
      const routeCustomers = r.route_customers || []
      const deliveries = (r.deliveries || []).map((d: any) => ({
        id: d.id,
        customerId: d.customer_id,
        routeId: d.route_id,
        status: d.status as "pending" | "delivered",
        visitOrder: d.visit_order,
        proofPhoto: d.proof_photo || undefined,
        notes: d.notes || undefined,
        deliveredAt: d.delivered_at || undefined,
        deliveredLatitude: d.delivered_latitude ? Number(d.delivered_latitude) : undefined,
        deliveredLongitude: d.delivered_longitude ? Number(d.delivered_longitude) : undefined,
      }))

      return {
        id: r.id,
        date: r.date,
        salespersonId: r.salesperson_id,
        salespersonName: salesperson?.name || "Unknown",
        customerIds: routeCustomers.map((rc: any) => rc.customer_id),
        deliveries,
        createdAt: r.created_at,
      }
    })
  },

  createRoute: async (
    route: Omit<Route, "id" | "createdAt" | "deliveries">
  ): Promise<Route> => {
    // Create route
    const { data: routeData, error: routeError } = await supabase
      .from("routes")
      .insert({
        date: route.date,
        salesperson_id: route.salespersonId,
      })
      .select()
      .single()

    if (routeError) throw routeError

    // Get salesperson name
    const { data: employeeData } = await supabase
      .from("employees")
      .select("name")
      .eq("id", route.salespersonId)
      .single()

    // Create route_customers entries
    const routeCustomers = route.customerIds.map((customerId, index) => ({
      route_id: routeData.id,
      customer_id: customerId,
      visit_order: index + 1,
    }))

    const { error: rcError } = await supabase
      .from("route_customers")
      .insert(routeCustomers)

    if (rcError) throw rcError

    // Create deliveries
    const deliveries = route.customerIds.map((customerId, index) => ({
      route_id: routeData.id,
      customer_id: customerId,
      status: "pending" as const,
      visit_order: index + 1,
    }))

    const { data: deliveriesData, error: deliveriesError } = await supabase
      .from("deliveries")
      .insert(deliveries)
      .select()

    if (deliveriesError) throw deliveriesError

    const formattedDeliveries: Delivery[] = (deliveriesData || []).map((d: any) => ({
      id: d.id,
      customerId: d.customer_id,
      routeId: d.route_id,
      status: d.status as "pending" | "delivered",
      visitOrder: d.visit_order,
      proofPhoto: d.proof_photo || undefined,
      notes: d.notes || undefined,
      deliveredAt: d.delivered_at || undefined,
      deliveredLatitude: d.delivered_latitude ? Number(d.delivered_latitude) : undefined,
      deliveredLongitude: d.delivered_longitude ? Number(d.delivered_longitude) : undefined,
    }))

    return {
      id: routeData.id,
      date: routeData.date,
      salespersonId: routeData.salesperson_id,
      salespersonName: employeeData?.name || "Unknown",
      customerIds: route.customerIds,
      deliveries: formattedDeliveries,
      createdAt: routeData.created_at,
    }
  },

  // Deliveries
  getDelivery: async (id: string): Promise<Delivery | undefined> => {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return undefined
      throw error
    }

    return {
      id: data.id,
      customerId: data.customer_id,
      routeId: data.route_id,
      status: data.status as "pending" | "delivered",
      visitOrder: data.visit_order,
      proofPhoto: data.proof_photo || undefined,
      notes: data.notes || undefined,
      deliveredAt: data.delivered_at || undefined,
      deliveredLatitude: data.delivered_latitude ? Number(data.delivered_latitude) : undefined,
      deliveredLongitude: data.delivered_longitude ? Number(data.delivered_longitude) : undefined,
    }
  },

  updateDelivery: async (
    routeId: string,
    deliveryId: string,
    updates: Partial<Delivery>
  ): Promise<Delivery> => {
    const updateData: any = {}
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.proofPhoto !== undefined) updateData.proof_photo = updates.proofPhoto
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.deliveredAt !== undefined) updateData.delivered_at = updates.deliveredAt
    if (updates.deliveredLatitude !== undefined) updateData.delivered_latitude = updates.deliveredLatitude
    if (updates.deliveredLongitude !== undefined) updateData.delivered_longitude = updates.deliveredLongitude

    const { data, error } = await supabase
      .from("deliveries")
      .update(updateData)
      .eq("id", deliveryId)
      .eq("route_id", routeId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      customerId: data.customer_id,
      routeId: data.route_id,
      status: data.status as "pending" | "delivered",
      visitOrder: data.visit_order,
      proofPhoto: data.proof_photo || undefined,
      notes: data.notes || undefined,
      deliveredAt: data.delivered_at || undefined,
      deliveredLatitude: data.delivered_latitude ? Number(data.delivered_latitude) : undefined,
      deliveredLongitude: data.delivered_longitude ? Number(data.delivered_longitude) : undefined,
    }
  },

  // Attendances
  getAttendances: async (date?: string): Promise<Attendance[]> => {
    let query = supabase.from("attendances").select("*")

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) throw error

    return (data || []).map((a) => ({
      id: a.id,
      employeeId: a.employee_id,
      date: a.date,
      clockIn: a.clock_in_time
        ? {
            time: a.clock_in_time,
            latitude: Number(a.clock_in_latitude),
            longitude: Number(a.clock_in_longitude),
          }
        : undefined,
      clockOut: a.clock_out_time
        ? {
            time: a.clock_out_time,
            latitude: Number(a.clock_out_latitude),
            longitude: Number(a.clock_out_longitude),
          }
        : undefined,
    }))
  },

  getAttendanceByEmployee: async (
    employeeId: string,
    date: string
  ): Promise<Attendance | undefined> => {
    const { data, error } = await supabase
      .from("attendances")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", date)
      .single()

    if (error) {
      if (error.code === "PGRST116") return undefined
      throw error
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      date: data.date,
      clockIn: data.clock_in_time
        ? {
            time: data.clock_in_time,
            latitude: Number(data.clock_in_latitude),
            longitude: Number(data.clock_in_longitude),
          }
        : undefined,
      clockOut: data.clock_out_time
        ? {
            time: data.clock_out_time,
            latitude: Number(data.clock_out_latitude),
            longitude: Number(data.clock_out_longitude),
          }
        : undefined,
    }
  },

  // Activity Logs
  getActivityLogsByEmployeeAndDate: async (
    employeeId: string,
    date: string
  ): Promise<ActivityLog[]> => {
    // Parse date to get start and end of day
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    return (data || []).map((log) => ({
      id: log.id,
      employeeId: log.employee_id,
      eventName: log.event_name,
      latitude: Number(log.latitude),
      longitude: Number(log.longitude),
      metadata: log.metadata || undefined,
      createdAt: log.created_at,
    }))
  },
}
