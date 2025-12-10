export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  region?: string;
}

export interface Delivery {
  id: string;
  customerId: string;
  routeId: string;
  status: "pending" | "delivered";
  visitOrder: number;
  proofPhoto?: string;
  notes?: string;
  deliveredAt?: string;
  deliveredLatitude?: number;
  deliveredLongitude?: number;
}

export interface Route {
  id: string;
  date: string;
  salespersonId: string;
  salespersonName: string;
  customerIds: string[];
  deliveries: Delivery[];
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: {
    time: string;
    latitude: number;
    longitude: number;
  };
  clockOut?: {
    time: string;
    latitude: number;
    longitude: number;
  };
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  eventName: string;
  latitude: number;
  longitude: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Mock Data
export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    role: "sales",
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "sales",
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    name: "Carol Williams",
    email: "carol@example.com",
    role: "sales",
    isActive: true,
    createdAt: "2024-01-04T00:00:00Z",
  },
];

export const mockCustomers: Customer[] = [
  // Java (Jakarta) - 6 customers
  {
    id: "1",
    name: "PT Toko Raya",
    address: "Jl. Sudirman No. 123, Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
    phone: "+62 812-3456-7890",
  },
  {
    id: "2",
    name: "CV Sumber Makmur",
    address: "Jl. Thamrin No. 45, Jakarta",
    latitude: -6.1944,
    longitude: 106.8229,
    phone: "+62 812-3456-7891",
  },
  {
    id: "3",
    name: "UD Berkah Jaya",
    address: "Jl. Gatot Subroto No. 78, Jakarta",
    latitude: -6.2297,
    longitude: 106.8003,
    phone: "+62 812-3456-7892",
  },
  {
    id: "4",
    name: "Toko Sejahtera",
    address: "Jl. Kebon Jeruk No. 12, Jakarta",
    latitude: -6.2,
    longitude: 106.7833,
    phone: "+62 812-3456-7893",
  },
  {
    id: "5",
    name: "PT Distributor Nusantara",
    address: "Jl. Senopati No. 56, Jakarta",
    latitude: -6.2275,
    longitude: 106.7975,
    phone: "+62 812-3456-7894",
  },
  {
    id: "6",
    name: "CV Mandiri Abadi",
    address: "Jl. Kuningan No. 34, Jakarta",
    latitude: -6.2383,
    longitude: 106.8306,
    phone: "+62 812-3456-7895",
  },
  // Sumatra - 4 customers
  {
    id: "7",
    name: "PT Medan Trading",
    address: "Jl. Gatot Subroto No. 88, Medan",
    latitude: 3.5952,
    longitude: 98.6722,
    phone: "+62 812-3456-7896",
  },
  {
    id: "8",
    name: "CV Palembang Jaya",
    address: "Jl. Sudirman No. 12, Palembang",
    latitude: -2.9761,
    longitude: 104.7754,
    phone: "+62 812-3456-7897",
  },
  {
    id: "9",
    name: "Toko Padang Makmur",
    address: "Jl. Ahmad Yani No. 45, Padang",
    latitude: -0.9492,
    longitude: 100.3543,
    phone: "+62 812-3456-7898",
  },
  {
    id: "10",
    name: "UD Bandar Lampung",
    address: "Jl. Raden Intan No. 23, Bandar Lampung",
    latitude: -5.4294,
    longitude: 105.2621,
    phone: "+62 812-3456-7899",
  },
];

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

export const mockRoutes: Route[] = [
  {
    id: "1",
    date: today,
    salespersonId: "2",
    salespersonName: "Alice Smith",
    customerIds: ["1", "2", "3"],
    deliveries: [
      {
        id: "d1",
        customerId: "1",
        routeId: "1",
        status: "delivered",
        visitOrder: 1,
        proofPhoto:
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
        notes: "Delivered successfully",
        deliveredAt: new Date(Date.now() - 3600000).toISOString(),
        deliveredLatitude: -6.2088,
        deliveredLongitude: 106.8456,
      },
      {
        id: "d2",
        customerId: "2",
        routeId: "1",
        status: "delivered",
        visitOrder: 2,
        proofPhoto:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        notes: "All items received",
        deliveredAt: new Date(Date.now() - 1800000).toISOString(),
        deliveredLatitude: -6.1944,
        deliveredLongitude: 106.8229,
      },
      {
        id: "d3",
        customerId: "3",
        routeId: "1",
        status: "pending",
        visitOrder: 3,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    date: today,
    salespersonId: "3",
    salespersonName: "Bob Johnson",
    customerIds: ["4", "5"],
    deliveries: [
      {
        id: "d4",
        customerId: "4",
        routeId: "2",
        status: "delivered",
        visitOrder: 1,
        proofPhoto:
          "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800",
        notes: "Quick delivery",
        deliveredAt: new Date(Date.now() - 7200000).toISOString(),
        deliveredLatitude: -6.2,
        deliveredLongitude: 106.7833,
      },
      {
        id: "d5",
        customerId: "5",
        routeId: "2",
        status: "pending",
        visitOrder: 2,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    date: today,
    salespersonId: "4",
    salespersonName: "Carol Williams",
    customerIds: ["6"],
    deliveries: [
      {
        id: "d6",
        customerId: "6",
        routeId: "3",
        status: "pending",
        visitOrder: 1,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockAttendances: Attendance[] = [
  {
    id: "a1",
    employeeId: "2",
    date: today,
    clockIn: {
      time: new Date(Date.now() - 28800000).toISOString(),
      latitude: -6.2088,
      longitude: 106.8456,
    },
  },
  {
    id: "a2",
    employeeId: "3",
    date: today,
    clockIn: {
      time: new Date(Date.now() - 25200000).toISOString(),
      latitude: -6.2,
      longitude: 106.7833,
    },
  },
  {
    id: "a3",
    employeeId: "4",
    date: today,
    clockIn: {
      time: new Date(Date.now() - 21600000).toISOString(),
      latitude: -6.2383,
      longitude: 106.8306,
    },
  },
];
