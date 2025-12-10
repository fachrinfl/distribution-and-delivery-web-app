import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Support both naming conventions
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET)"
  );
}

// Use service role key for seeding (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Indonesian names for sales users
const indonesianFirstNames = [
  "Ahmad",
  "Budi",
  "Cahya",
  "Dedi",
  "Eko",
  "Fajar",
  "Gunawan",
  "Hadi",
  "Indra",
  "Joko",
  "Kurniawan",
  "Lukman",
  "Mulyadi",
  "Nur",
  "Omar",
  "Prasetyo",
  "Rahmat",
  "Sari",
  "Taufik",
  "Udin",
  "Wahyu",
  "Yanto",
  "Zainal",
  "Ade",
  "Bayu",
  "Candra",
  "Doni",
  "Eka",
  "Firman",
  "Guntur",
];

const indonesianLastNames = [
  "Santoso",
  "Wijaya",
  "Prasetyo",
  "Sari",
  "Kurniawan",
  "Setiawan",
  "Hidayat",
  "Saputra",
  "Rahman",
  "Nugroho",
  "Siregar",
  "Siregar",
  "Tanuwijaya",
  "Siregar",
  "Ginting",
  "Sinaga",
  "Lubis",
  "Nasution",
  "Harahap",
  "Siregar",
  "Simanjuntak",
  "Sitompul",
  "Sitorus",
  "Pangaribuan",
];

// Indonesian business name prefixes
const businessPrefixes = ["PT", "CV", "UD", "Toko", "Warung", "Kios"];

const businessSuffixes = [
  "Makmur",
  "Sejahtera",
  "Jaya",
  "Abadi",
  "Sukses",
  "Mandiri",
  "Bersama",
  "Raya",
  "Nusantara",
  "Indah",
  "Mulia",
  "Utama",
  "Prima",
  "Sentosa",
  "Lestari",
  "Agung",
];

// Indonesian cities with coordinates
const cities = {
  java: [
    { name: "Jakarta", lat: -6.2088, lng: 106.8456 },
    { name: "Bandung", lat: -6.9175, lng: 107.6191 },
    { name: "Surabaya", lat: -7.2575, lng: 112.7521 },
    { name: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
    { name: "Semarang", lat: -6.9667, lng: 110.4167 },
    { name: "Malang", lat: -7.9666, lng: 112.6326 },
    { name: "Bekasi", lat: -6.2383, lng: 106.9756 },
    { name: "Tangerang", lat: -6.1781, lng: 106.63 },
    { name: "Depok", lat: -6.3947, lng: 106.8306 },
    { name: "Bogor", lat: -6.5944, lng: 106.7892 },
  ],
  sumatra: [
    { name: "Medan", lat: 3.5952, lng: 98.6722 },
    { name: "Palembang", lat: -2.9761, lng: 104.7754 },
    { name: "Padang", lat: -0.9492, lng: 100.3543 },
    { name: "Bandar Lampung", lat: -5.4294, lng: 105.2621 },
    { name: "Pekanbaru", lat: 0.5071, lng: 101.4478 },
    { name: "Batam", lat: 1.0456, lng: 104.0305 },
    { name: "Jambi", lat: -1.6101, lng: 103.6131 },
    { name: "Bengkulu", lat: -3.8006, lng: 102.2562 },
    { name: "Banda Aceh", lat: 5.5483, lng: 95.3238 },
    { name: "Dumai", lat: 1.6664, lng: 101.4002 },
  ],
};

// Regions data
const regionsData = [
  {
    name: "Sumatra",
    shortName: "Sumatra",
    centerLat: 0.7893,
    centerLng: 101.3431,
    isCovered: true,
  },
  {
    name: "Java",
    shortName: "Java",
    centerLat: -7.4917,
    centerLng: 110.0044,
    isCovered: true,
  },
  {
    name: "Kalimantan",
    shortName: "Kalimantan",
    centerLat: -0.7893,
    centerLng: 113.9213,
    isCovered: false,
  },
  {
    name: "Sulawesi",
    shortName: "Sulawesi",
    centerLat: -2.5489,
    centerLng: 121.0,
    isCovered: false,
  },
  {
    name: "Papua",
    shortName: "Papua",
    centerLat: -4.2699,
    centerLng: 138.0804,
    isCovered: false,
  },
  {
    name: "Bali & Nusa Tenggara",
    shortName: "Bali & NT",
    centerLat: -8.4095,
    centerLng: 115.1889,
    isCovered: false,
  },
  {
    name: "Maluku",
    shortName: "Maluku",
    centerLat: -3.2389,
    centerLng: 130.1453,
    isCovered: false,
  },
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Retry helper function for network operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isNetworkError =
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("SocketError") ||
        error?.message?.includes("ECONNRESET") ||
        error?.code === "UND_ERR_SOCKET";

      if (isNetworkError && i < maxRetries - 1) {
        console.warn(
          `Network error (attempt ${
            i + 1
          }/${maxRetries}), retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

function generatePhoneNumber(): string {
  const prefixes = [
    "812",
    "813",
    "821",
    "822",
    "823",
    "831",
    "832",
    "833",
    "851",
    "852",
    "853",
    "855",
    "856",
    "857",
    "858",
    "859",
  ];
  const prefix = randomElement(prefixes);
  const number = String(randomInt(10000000, 99999999));
  return `+62 ${prefix}-${number.slice(0, 4)}-${number.slice(4)}`;
}

function generateBusinessName(): string {
  const prefix = randomElement(businessPrefixes);
  const suffix = randomElement(businessSuffixes);
  const middle = randomElement([
    "Trading",
    "Distributor",
    "Supplier",
    "Agen",
    "Mitra",
    "",
  ]);
  return middle ? `${prefix} ${suffix} ${middle}` : `${prefix} ${suffix}`;
}

function generateCoordinates(city: { lat: number; lng: number }): {
  lat: number;
  lng: number;
} {
  // Add small random offset (within ~10km)
  const offset = 0.1;
  return {
    lat: city.lat + randomFloat(-offset, offset),
    lng: city.lng + randomFloat(-offset, offset),
  };
}

async function seedRegions() {
  console.log("Seeding regions...");

  // Transform regionsData to match database schema (snake_case)
  const regionsDataForDB = regionsData.map((region) => ({
    name: region.name,
    short_name: region.shortName,
    center_lat: region.centerLat,
    center_lng: region.centerLng,
    is_covered: region.isCovered,
  }));

  const { data, error } = await supabase
    .from("regions")
    .upsert(regionsDataForDB, { onConflict: "name" })
    .select();

  if (error) {
    console.error("Error seeding regions:", error);
    throw error;
  }

  console.log(`✓ Seeded ${data.length} regions`);
  return data;
}

async function seedEmployees(regions: any[]) {
  console.log("Seeding employees...");

  // Create admin users first
  const adminUsers = [
    { name: "Admin User", email: "admin@sales-tracker.com", role: "admin" },
    {
      name: "Super Admin",
      email: "superadmin@sales-tracker.com",
      role: "admin",
    },
  ];

  // Create 25+ sales users
  const salesUsers = [];
  for (let i = 0; i < 27; i++) {
    const firstName = randomElement(indonesianFirstNames);
    const lastName = randomElement(indonesianLastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sales-tracker.com`;
    salesUsers.push({ name, email, role: "sales" });
  }

  const allEmployees = [...adminUsers, ...salesUsers];
  const employees = [];

  for (const emp of allEmployees) {
    let authUserId: string | undefined;

    // Check if employee already exists first
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select()
      .eq("email", emp.email)
      .single();

    // If employee exists, use its auth_user_id
    if (existingEmployee?.auth_user_id) {
      authUserId = existingEmployee.auth_user_id;
      // Update password for existing auth user
      try {
        await retryOperation(async () => {
          const { error } = await supabase.auth.admin.updateUserById(
            authUserId!,
            {
              password: "password123",
            }
          );
          if (error) throw error;
        });
      } catch (updateError) {
        console.warn(
          `Could not update password for ${emp.email}, continuing...`
        );
      }

      // Update employee record
      const { data: updated, error: updateError } = await supabase
        .from("employees")
        .update({
          name: emp.name,
          role: emp.role,
          is_active: true,
        })
        .eq("email", emp.email)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating employee ${emp.email}:`, updateError);
        continue;
      }

      if (updated) {
        employees.push(updated);
      } else {
        employees.push(existingEmployee);
      }
      continue; // Skip to next employee
    }

    // Try to create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: emp.email,
        password: "password123",
        email_confirm: true,
      });

    if (authError) {
      // If user already exists, try to find it by querying employees or using a workaround
      if (
        authError.code === "email_exists" ||
        authError.message.includes("already registered")
      ) {
        // Try to get user by attempting to list users with pagination
        // But first, let's try a simpler approach: create employee without auth_user_id first,
        // then we can update it later if needed. Actually, that won't work for login.

        // Better approach: try to get user by email using admin API
        // Since listUsers might fail, we'll use a workaround:
        // Try to sign in as the user to verify it exists, but we need the ID...

        // Actually, the best approach: if email exists, we'll try to find the user
        // by checking if there's an employee with this email that has an auth_user_id
        // If not, we'll need to manually get the user ID

        // For now, let's skip users that already exist and can't be found
        // The employee record might already exist from a previous run
        console.warn(
          `Auth user ${emp.email} already exists. Skipping creation but will try to find existing employee.`
        );

        // Try to get existing employee one more time (in case it was just created)
        const { data: checkEmployee } = await supabase
          .from("employees")
          .select()
          .eq("email", emp.email)
          .single();

        if (checkEmployee) {
          employees.push(checkEmployee);
        }
        continue;
      } else {
        console.error(`Error creating auth user for ${emp.email}:`, authError);
        continue;
      }
    } else {
      authUserId = authData?.user?.id;
    }

    if (!authUserId) {
      console.error(`No auth user ID for ${emp.email}`);
      continue;
    }

    // Create new employee record
    const { data, error } = await supabase
      .from("employees")
      .insert({
        email: emp.email,
        name: emp.name,
        role: emp.role,
        is_active: true,
        auth_user_id: authUserId,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating employee ${emp.email}:`, error);
      continue;
    }

    if (data) {
      employees.push(data);
    }
  }

  console.log(`✓ Seeded ${employees.length} employees`);
  return employees;
}

async function seedCustomers(regions: any[], salesEmployees: any[]) {
  console.log("Seeding customers...");

  const coveredRegions = regions.filter((r) => r.is_covered);
  const javaRegion = regions.find((r) => r.name === "Java");
  const sumatraRegion = regions.find((r) => r.name === "Sumatra");

  const customers = [];
  let customerCount = 0;

  // Distribute customers among sales employees
  // Each sales person gets 15-20 customers
  for (const sales of salesEmployees) {
    const customerCountForSales = randomInt(15, 20);

    // Randomly assign region (Java or Sumatra)
    const region = randomElement([javaRegion, sumatraRegion]);
    const cityList = region.name === "Java" ? cities.java : cities.sumatra;

    for (let i = 0; i < customerCountForSales; i++) {
      const city = randomElement(cityList);
      const coords = generateCoordinates(city);
      const businessName = generateBusinessName();
      const address = `Jl. ${randomElement([
        "Sudirman",
        "Thamrin",
        "Gatot Subroto",
        "Ahmad Yani",
        "Raden Intan",
        "Merdeka",
      ])} No. ${randomInt(1, 999)}, ${city.name}`;

      try {
        const result = await retryOperation(async () => {
          const { data, error } = await supabase
            .from("customers")
            .insert({
              name: businessName,
              address,
              latitude: coords.lat,
              longitude: coords.lng,
              phone: generatePhoneNumber(),
              region_id: region.id,
            })
            .select()
            .single();

          return { data, error };
        });

        if (result.error) {
          console.error(`Error creating customer:`, result.error);
          continue;
        }

        if (result.data) {
          customers.push(result.data);
          customerCount++;
        }
      } catch (error) {
        console.error(`Error creating customer after retries:`, error);
        continue;
      }
    }
  }

  console.log(`✓ Seeded ${customerCount} customers`);
  return customers;
}

async function seedRoutes(salesEmployees: any[], customers: any[]) {
  console.log("Seeding routes...");

  const routes = [];
  const today = new Date();

  // Generate routes for past 7 days and today
  for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Randomly select some sales employees to have routes each day
    const activeSales = salesEmployees.filter(() => Math.random() > 0.3); // 70% chance

    for (const sales of activeSales) {
      // Get customers for this sales person (randomly assign 3-8 customers per route)
      const salesCustomers = customers
        .filter(() => Math.random() > 0.5)
        .slice(0, randomInt(3, 8));

      if (salesCustomers.length === 0) continue;

      try {
        const result = await retryOperation(async () => {
          const { data, error } = await supabase
            .from("routes")
            .insert({
              date: dateStr,
              salesperson_id: sales.id,
            })
            .select()
            .single();
          return { data, error };
        });

        const route = result.data;
        const routeError = result.error;

        if (routeError && !routeError.message.includes("duplicate key")) {
          console.error(`Error creating route:`, routeError);
          continue;
        }

        if (route) {
          // Create route_customers entries with retry
          const routeCustomers = salesCustomers.map((customer, index) => ({
            route_id: route.id,
            customer_id: customer.id,
            visit_order: index + 1,
          }));

          await retryOperation(async () => {
            const { error } = await supabase
              .from("route_customers")
              .insert(routeCustomers);
            if (error) throw error;
          });
          routes.push(route);
        }
      } catch (error) {
        console.error(`Failed to create route after retries:`, error);
        continue;
      }
    }
  }

  console.log(`✓ Seeded ${routes.length} routes`);
  return routes;
}

async function seedDeliveries(routes: any[], customers: any[]) {
  console.log("Seeding deliveries...");

  let deliveryCount = 0;

  for (const route of routes) {
    // Get customers for this route
    const { data: routeCustomers } = await supabase
      .from("route_customers")
      .select("customer_id, visit_order")
      .eq("route_id", route.id)
      .order("visit_order");

    if (!routeCustomers || routeCustomers.length === 0) continue;

    const routeDate = new Date(route.date);
    const baseTime = new Date(routeDate);
    baseTime.setHours(8, 0, 0, 0); // Start at 8 AM

    for (const rc of routeCustomers) {
      const customer = customers.find((c) => c.id === rc.customer_id);
      if (!customer) continue;

      // Determine delivery status (30% fully delivered, 50% partial, 20% pending)
      const rand = Math.random();
      let status: "pending" | "delivered" = "pending";
      let deliveredAt: string | null = null;
      let deliveredLat: number | null = null;
      let deliveredLng: number | null = null;
      let proofPhoto: string | null = null;
      let notes: string | null = null;

      if (rand < 0.3) {
        // Fully delivered
        status = "delivered";
        const deliveryTime = new Date(baseTime);
        deliveryTime.setMinutes(
          deliveryTime.getMinutes() + rc.visit_order * 45
        ); // 45 min between deliveries
        deliveredAt = deliveryTime.toISOString();
        deliveredLat = customer.latitude + randomFloat(-0.001, 0.001);
        deliveredLng = customer.longitude + randomFloat(-0.001, 0.001);
        // Use valid Unsplash image IDs
        const validUnsplashIds = [
          "1560472354-b33ff0c44a43",
          "1558618666-fcd25c85cd64",
          "1556740758-90de374c12ad",
          "1586528116311-8d99a48b8813",
          "1573164574511-73c8d8c0c5b3",
          "1560472355-536de373c1b1",
          "1558618047-3c8c76b0b3b1",
          "1558618666-fcd25c85cd64",
          "1560472354-b33ff0c44a43",
          "1556740758-90de374c12ad",
        ];
        proofPhoto = `https://images.unsplash.com/photo-${randomElement(
          validUnsplashIds
        )}?w=800`;
        notes = randomElement([
          "Delivered successfully",
          "All items received",
          "Quick delivery",
          "Customer satisfied",
        ]);
      } else if (rand < 0.8) {
        // Partial - some delivered, some pending (skip for now, will be handled by visit order)
        status = "delivered";
        const deliveryTime = new Date(baseTime);
        deliveryTime.setMinutes(
          deliveryTime.getMinutes() + rc.visit_order * 45
        );
        deliveredAt = deliveryTime.toISOString();
        deliveredLat = customer.latitude + randomFloat(-0.001, 0.001);
        deliveredLng = customer.longitude + randomFloat(-0.001, 0.001);
        // Use valid Unsplash image IDs
        const validUnsplashIds = [
          "1560472354-b33ff0c44a43",
          "1558618666-fcd25c85cd64",
          "1556740758-90de374c12ad",
          "1586528116311-8d99a48b8813",
          "1573164574511-73c8d8c0c5b3",
          "1560472355-536de373c1b1",
          "1558618047-3c8c76b0b3b1",
          "1558618666-fcd25c85cd64",
          "1560472354-b33ff0c44a43",
          "1556740758-90de374c12ad",
        ];
        proofPhoto = `https://images.unsplash.com/photo-${randomElement(
          validUnsplashIds
        )}?w=800`;
        notes = randomElement(["Delivered successfully", "All items received"]);
      }

      try {
        await retryOperation(async () => {
          const { error } = await supabase.from("deliveries").insert({
            route_id: route.id,
            customer_id: customer.id,
            status,
            visit_order: rc.visit_order,
            proof_photo: proofPhoto,
            notes,
            delivered_at: deliveredAt,
            delivered_latitude: deliveredLat,
            delivered_longitude: deliveredLng,
          });
          if (error) throw error;
        });
      } catch (error) {
        console.error(`Error creating delivery after retries:`, error);
        continue;
      }

      deliveryCount++;
    }
  }

  console.log(`✓ Seeded ${deliveryCount} deliveries`);
}

async function seedAttendances(salesEmployees: any[]) {
  console.log("Seeding attendances...");

  const today = new Date();
  let attendanceCount = 0;

  // Generate attendances for past 7 days and today
  for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Randomly select active sales employees (80% chance)
    const activeSales = salesEmployees.filter(() => Math.random() > 0.2);

    for (const sales of activeSales) {
      // Clock in between 7-9 AM
      const clockInHour = randomInt(7, 9);
      const clockInMinute = randomInt(0, 59);
      const clockInTime = new Date(date);
      clockInTime.setHours(clockInHour, clockInMinute, 0, 0);

      // 70% chance of clock out (between 5-7 PM)
      const hasClockOut = Math.random() < 0.7;
      let clockOutTime: Date | null = null;
      if (hasClockOut) {
        const clockOutHour = randomInt(17, 19);
        const clockOutMinute = randomInt(0, 59);
        clockOutTime = new Date(date);
        clockOutTime.setHours(clockOutHour, clockOutMinute, 0, 0);
      }

      // Use Jakarta coordinates as base (can be adjusted)
      const baseLat = -6.2088;
      const baseLng = 106.8456;

      try {
        await retryOperation(async () => {
          const { error } = await supabase.from("attendances").upsert(
            {
              employee_id: sales.id,
              date: dateStr,
              clock_in_time: clockInTime.toISOString(),
              clock_in_latitude: baseLat + randomFloat(-0.01, 0.01),
              clock_in_longitude: baseLng + randomFloat(-0.01, 0.01),
              clock_out_time: clockOutTime?.toISOString() || null,
              clock_out_latitude: hasClockOut
                ? baseLat + randomFloat(-0.01, 0.01)
                : null,
              clock_out_longitude: hasClockOut
                ? baseLng + randomFloat(-0.01, 0.01)
                : null,
            },
            { onConflict: "employee_id,date" }
          );
          if (error) throw error;
        });
      } catch (error) {
        console.error(`Error creating attendance after retries:`, error);
        continue;
      }

      attendanceCount++;
    }
  }

  console.log(`✓ Seeded ${attendanceCount} attendances`);
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

// Helper function to generate road-like path points between two locations
// Uses bezier curve approach to simulate realistic road paths
function generateRoadLikePath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  distanceKm: number
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];

  // Calculate number of waypoints based on distance (approximately every 1-2km)
  // But limit to reasonable number (max 10 waypoints)
  const waypointInterval = 1.5; // km
  const numWaypoints = Math.min(
    Math.max(2, Math.floor(distanceKm / waypointInterval)),
    10
  );

  // Create control points for bezier curve (simulating road curves)
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;

  // Validate inputs
  if (
    !Number.isFinite(startLat) || !Number.isFinite(startLng) ||
    !Number.isFinite(endLat) || !Number.isFinite(endLng) ||
    !Number.isFinite(distanceKm)
  ) {
    return points; // Return empty array if inputs are invalid
  }
  
  // If distance is very small (< 100m), return empty array (no waypoints needed)
  if (distanceKm < 0.1) {
    return points;
  }

  // Add perpendicular offset to create a curved path (simulating road turns)
  const dx = endLng - startLng;
  const dy = endLat - startLat;
  const perpendicularX = -dy;
  const perpendicularY = dx;
  const length = Math.sqrt(
    perpendicularX * perpendicularX + perpendicularY * perpendicularY
  );

  // Handle case where start and end are the same (length = 0)
  let controlLat = midLat;
  let controlLng = midLng;
  
  if (length > 0.0001) { // Avoid division by zero
    // Control point offset (creates a curve, not straight line)
    const curveAmount = randomFloat(0.1, 0.3); // Varies the curve
    controlLat = midLat + (perpendicularY / length) * curveAmount * 0.01;
    controlLng = midLng + (perpendicularX / length) * curveAmount * 0.01;
  }

  // Generate points along bezier curve
  for (let i = 1; i < numWaypoints; i++) {
    const t = i / numWaypoints;

    // Quadratic bezier curve: (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const lat =
      (1 - t) * (1 - t) * startLat +
      2 * (1 - t) * t * controlLat +
      t * t * endLat;
    const lng =
      (1 - t) * (1 - t) * startLng +
      2 * (1 - t) * t * controlLng +
      t * t * endLng;

    // Validate calculated coordinates
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue; // Skip invalid points
    }

    // Add small random variations to simulate road imperfections
    const finalLat = lat + randomFloat(-0.002, 0.002);
    const finalLng = lng + randomFloat(-0.002, 0.002);
    
    // Final validation
    if (Number.isFinite(finalLat) && Number.isFinite(finalLng)) {
      points.push({
        lat: finalLat,
        lng: finalLng,
      });
    }
  }

  return points;
}

async function seedActivityLogs(
  routes: any[],
  customers: any[],
  salesEmployees: any[]
) {
  console.log("Seeding activity logs...");

  let activityLogCount = 0;
  const BATCH_SIZE = 100; // Insert in batches of 100
  const allActivityLogs: any[] = [];

  for (const route of routes) {
    const salesEmployee = salesEmployees.find(
      (e) => e.id === route.salesperson_id
    );
    if (!salesEmployee) continue;

    const routeDate = new Date(route.date);
    routeDate.setHours(8, 0, 0, 0); // Start route at 8 AM

    // Get customers for this route in visit order
    const { data: routeCustomers } = await supabase
      .from("route_customers")
      .select("customer_id, visit_order")
      .eq("route_id", route.id)
      .order("visit_order");

    if (!routeCustomers || routeCustomers.length === 0) continue;

    const sortedCustomers = routeCustomers
      .map((rc) => {
        const customer = customers.find((c) => c.id === rc.customer_id);
        return customer ? { customer, visitOrder: rc.visit_order } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a?.visitOrder || 0) - (b?.visitOrder || 0));

    if (sortedCustomers.length === 0) continue;

    // Get deliveries for this route to check which customers were visited
    const { data: deliveries } = await supabase
      .from("deliveries")
      .select("*")
      .eq("route_id", route.id);

    const deliveredCustomers = new Set(
      deliveries
        ?.filter((d) => d.status === "delivered")
        .map((d) => d.customer_id) || []
    );

    let currentTime = new Date(routeDate);
    const firstCustomer = sortedCustomers[0]?.customer;
    if (!firstCustomer || !Number.isFinite(firstCustomer.latitude) || !Number.isFinite(firstCustomer.longitude)) {
      continue; // Skip routes with invalid customer data
    }
    
    let currentLat = firstCustomer.latitude;
    let currentLng = firstCustomer.longitude;
    let sequenceNumber = 1; // Track sequence for the day

    // Add starting point (clock-in location or first customer)
    allActivityLogs.push({
      employee_id: salesEmployee.id,
      event_name: "location_update",
      latitude: currentLat,
      longitude: currentLng,
      metadata: {
        route_id: route.id,
        sequence_number: sequenceNumber++,
        is_start: true,
        description: "Route start",
      },
      created_at: currentTime.toISOString(),
    });

    // Generate activity logs for the route
    for (let i = 0; i < sortedCustomers.length; i++) {
      const item = sortedCustomers[i];
      if (!item) continue;

      const { customer, visitOrder } = item;
      
      // Validate customer coordinates
      if (!customer || !Number.isFinite(customer.latitude) || !Number.isFinite(customer.longitude)) {
        continue; // Skip invalid customers
      }
      
      const targetLat = customer.latitude;
      const targetLng = customer.longitude;

      // Validate current position
      if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
        currentLat = targetLat;
        currentLng = targetLng;
      }

      // Calculate distance and travel time (assuming 40 km/h average speed)
      const distance = calculateDistance(
        currentLat,
        currentLng,
        targetLat,
        targetLng
      );
      const distanceKm = distance / 1000;
      const travelTimeMinutes = Math.max(5, Math.ceil((distanceKm / 40) * 60)); // At least 5 minutes

      // Generate road-like path points (approximately every 1-2km, max 10 waypoints)
      const waypoints = generateRoadLikePath(
        currentLat,
        currentLng,
        targetLat,
        targetLng,
        distanceKm
      );

      // Collect location updates during travel (spaced by time)
      const timePerWaypoint = waypoints.length > 0 ? travelTimeMinutes / (waypoints.length + 1) : 0;
      for (let j = 0; j < waypoints.length; j++) {
        const point = waypoints[j];
        
        // Validate waypoint coordinates
        if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
          continue; // Skip invalid waypoints
        }
        
        const pointTime = new Date(currentTime);
        pointTime.setMinutes(
          pointTime.getMinutes() + Math.floor(timePerWaypoint * (j + 1))
        );

        allActivityLogs.push({
          employee_id: salesEmployee.id,
          event_name: "location_update",
          latitude: point.lat,
          longitude: point.lng,
          metadata: {
            route_id: route.id,
            customer_id: customer.id,
            visit_order: visitOrder,
            sequence_number: sequenceNumber++,
            is_traveling: true,
            description: `Traveling to customer #${visitOrder}`,
          },
          created_at: pointTime.toISOString(),
        });
      }

      // Update current position
      currentLat = targetLat;
      currentLng = targetLng;
      currentTime.setMinutes(currentTime.getMinutes() + travelTimeMinutes);

      // Add arrival point at customer location
      const arrivalTime = new Date(currentTime);
      if (Number.isFinite(targetLat) && Number.isFinite(targetLng)) {
        allActivityLogs.push({
          employee_id: salesEmployee.id,
          event_name: "location_update",
          latitude: targetLat,
          longitude: targetLng,
          metadata: {
            route_id: route.id,
            customer_id: customer.id,
            visit_order: visitOrder,
            sequence_number: sequenceNumber++,
            is_at_customer: true,
            description: `Arrived at customer #${visitOrder}`,
          },
          created_at: arrivalTime.toISOString(),
        });
      }

      // If customer was delivered, add activity logs near customer location
      if (deliveredCustomers.has(customer.id)) {
        // Add 1-2 location updates near customer (simulating time spent at location)
        const timeAtCustomer = randomInt(15, 25); // 15-25 minutes at customer
        for (let k = 0; k < randomInt(1, 2); k++) {
          const visitTime = new Date(currentTime);
          visitTime.setMinutes(
            visitTime.getMinutes() + Math.floor((timeAtCustomer * (k + 1)) / 3)
          );

          // Add small random offset to simulate movement within customer location
          const visitLat = targetLat + randomFloat(-0.0008, 0.0008); // ~100m radius
          const visitLng = targetLng + randomFloat(-0.0008, 0.0008);

          // Validate coordinates before adding
          if (Number.isFinite(visitLat) && Number.isFinite(visitLng)) {
            allActivityLogs.push({
              employee_id: salesEmployee.id,
              event_name: "location_update",
              latitude: visitLat,
              longitude: visitLng,
              metadata: {
                route_id: route.id,
                customer_id: customer.id,
                visit_order: visitOrder,
                sequence_number: sequenceNumber++,
                is_at_customer: true,
                near_customer: true,
                description: `At customer #${visitOrder} location`,
              },
              created_at: visitTime.toISOString(),
            });
          }
        }

        // Add COMPLETE_DELIVERY event at customer location
        const deliveryTime = new Date(currentTime);
        deliveryTime.setMinutes(
          deliveryTime.getMinutes() + Math.floor(timeAtCustomer / 2)
        );

        const deliveryLat = targetLat + randomFloat(-0.0003, 0.0003);
        const deliveryLng = targetLng + randomFloat(-0.0003, 0.0003);
        
        // Validate coordinates before adding
        if (Number.isFinite(deliveryLat) && Number.isFinite(deliveryLng)) {
          allActivityLogs.push({
            employee_id: salesEmployee.id,
            event_name: "COMPLETE_DELIVERY",
            latitude: deliveryLat,
            longitude: deliveryLng,
            metadata: {
              route_id: route.id,
              customer_id: customer.id,
              visit_order: visitOrder,
              sequence_number: sequenceNumber++,
              delivery_completed: true,
              description: `Completed delivery to customer #${visitOrder}`,
            },
            created_at: deliveryTime.toISOString(),
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + timeAtCustomer);
      } else {
        // For pending deliveries, add a single location update (passed by but didn't stop)
        const passTime = new Date(currentTime);
        passTime.setMinutes(passTime.getMinutes() + 2);

        const passLat = targetLat + randomFloat(-0.003, 0.003); // Further away (didn't stop)
        const passLng = targetLng + randomFloat(-0.003, 0.003);
        
        // Validate coordinates before adding
        if (Number.isFinite(passLat) && Number.isFinite(passLng)) {
          allActivityLogs.push({
            employee_id: salesEmployee.id,
            event_name: "location_update",
            latitude: passLat,
            longitude: passLng,
            metadata: {
              route_id: route.id,
              customer_id: customer.id,
              visit_order: visitOrder,
              sequence_number: sequenceNumber++,
              is_at_customer: false,
              near_customer: false,
              description: `Passed customer #${visitOrder} (pending)`,
            },
            created_at: passTime.toISOString(),
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + 5);
      }
    }

    // Add ending point (last location of the day)
    const endTime = new Date(currentTime);
    endTime.setHours(17, 0, 0, 0); // End around 5 PM
    
    // Validate coordinates before adding end point
    if (Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
      allActivityLogs.push({
        employee_id: salesEmployee.id,
        event_name: "location_update",
        latitude: currentLat,
        longitude: currentLng,
        metadata: {
          route_id: route.id,
          sequence_number: sequenceNumber++,
          is_end: true,
          description: "Route end",
        },
        created_at: endTime.toISOString(),
      });
    }
  }

  // Batch insert activity logs
  console.log(
    `  Inserting ${allActivityLogs.length} activity logs in batches of ${BATCH_SIZE}...`
  );

  for (let i = 0; i < allActivityLogs.length; i += BATCH_SIZE) {
    const batch = allActivityLogs.slice(i, i + BATCH_SIZE);

    try {
      await retryOperation(async () => {
        const { error } = await supabase.from("activity_logs").insert(batch);
        if (error) throw error;
      });
      activityLogCount += batch.length;
      if (
        (i + BATCH_SIZE) % 500 === 0 ||
        i + BATCH_SIZE >= allActivityLogs.length
      ) {
        console.log(
          `  Progress: ${Math.min(i + BATCH_SIZE, allActivityLogs.length)}/${
            allActivityLogs.length
          } logs inserted`
        );
      }
    } catch (error) {
      console.error(
        `Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
      // Continue with next batch even if one fails
    }
  }

  console.log(`✓ Seeded ${activityLogCount} activity logs`);
}

async function main() {
  console.log("Starting seed process...\n");

  try {
    // Seed in order
    const regions = await seedRegions();
    const employees = await seedEmployees(regions);
    const salesEmployees = employees.filter((e) => e.role === "sales");
    const customers = await seedCustomers(regions, salesEmployees);
    const routes = await seedRoutes(salesEmployees, customers);
    await seedDeliveries(routes, customers);
    await seedAttendances(salesEmployees);
    await seedActivityLogs(routes, customers, salesEmployees);

    console.log("\n✓ Seed process completed successfully!");
    console.log("\nSummary:");
    console.log(`- Regions: ${regions.length}`);
    console.log(
      `- Employees: ${employees.length} (${
        employees.filter((e) => e.role === "admin").length
      } admins, ${salesEmployees.length} sales)`
    );
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Routes: ${routes.length}`);
    console.log(
      `- Attendances: Generated for ${salesEmployees.length} sales employees over 8 days`
    );
    console.log(`- Activity Logs: Generated for routes`);
  } catch (error) {
    console.error("Seed process failed:", error);
    process.exit(1);
  }
}

main();
