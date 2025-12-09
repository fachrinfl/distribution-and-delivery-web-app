import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_SECRET)"
  );
}

// Use service role key for dropping data (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dropAllData() {
  console.log("Dropping all data...\n");

  try {
    // Delete in reverse order of dependencies
    console.log("Deleting attendances...");
    const { error: attendancesError } = await supabase
      .from("attendances")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
    if (attendancesError) console.error("Error deleting attendances:", attendancesError);
    else console.log("✓ Deleted attendances");

    console.log("Deleting deliveries...");
    const { error: deliveriesError } = await supabase
      .from("deliveries")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deliveriesError) console.error("Error deleting deliveries:", deliveriesError);
    else console.log("✓ Deleted deliveries");

    console.log("Deleting route_customers...");
    const { error: routeCustomersError } = await supabase
      .from("route_customers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (routeCustomersError) console.error("Error deleting route_customers:", routeCustomersError);
    else console.log("✓ Deleted route_customers");

    console.log("Deleting routes...");
    const { error: routesError } = await supabase
      .from("routes")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (routesError) console.error("Error deleting routes:", routesError);
    else console.log("✓ Deleted routes");

    console.log("Deleting customers...");
    const { error: customersError } = await supabase
      .from("customers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (customersError) console.error("Error deleting customers:", customersError);
    else console.log("✓ Deleted customers");

    console.log("Deleting employees (and auth users)...");
    // Get all employees first
    const { data: employees } = await supabase.from("employees").select("auth_user_id");
    
    // Delete all auth users (including those not linked to employees)
    const { data: allAuthUsers } = await supabase.auth.admin.listUsers();
    if (allAuthUsers?.users) {
      for (const user of allAuthUsers.users) {
        try {
          await supabase.auth.admin.deleteUser(user.id);
        } catch (error) {
          // Ignore errors for users that might already be deleted
        }
      }
    }

    const { error: employeesError } = await supabase
      .from("employees")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (employeesError) console.error("Error deleting employees:", employeesError);
    else console.log("✓ Deleted employees");

    console.log("Deleting regions...");
    const { error: regionsError } = await supabase
      .from("regions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (regionsError) console.error("Error deleting regions:", regionsError);
    else console.log("✓ Deleted regions");

    console.log("\n✓ All data dropped successfully!");
  } catch (error) {
    console.error("Error dropping data:", error);
    throw error;
  }
}

dropAllData().catch(console.error);

