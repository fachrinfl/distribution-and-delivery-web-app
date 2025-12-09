import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

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

async function runMigration() {
  console.log("Reading migration file...");
  const migrationSQL = readFileSync(
    join(process.cwd(), "supabase/migrations/001_initial_schema.sql"),
    "utf-8"
  );

  // Extract project reference and construct database connection string
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    throw new Error("Could not extract project reference from Supabase URL");
  }

  // Get database password from service role key or construct connection string
  // Supabase connection string format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  // We need to get the database password from Supabase dashboard or use the connection pooling URL

  console.log(
    "⚠️  To execute migrations automatically, you need the database connection string."
  );
  console.log("You can find it in your Supabase dashboard:\n");
  console.log(
    `   https://app.supabase.com/project/${projectRef}/settings/database\n`
  );
  console.log("Then set it as DATABASE_URL in your .env.local file.\n");
  console.log("Alternatively, run the migration manually:\n");
  console.log("📋 Steps:");
  console.log(
    `   1. Open: https://app.supabase.com/project/${projectRef}/sql/new`
  );
  console.log("   2. Copy the SQL below and paste it into the editor");
  console.log('   3. Click "Run" to execute');
  console.log("   4. Then run: npm run seed\n");
  console.log("─".repeat(70));
  console.log(migrationSQL.substring(0, 500) + "...");
  console.log("─".repeat(70));
  console.log(
    "\n💡 Full SQL file: supabase/migrations/001_initial_schema.sql\n"
  );

  // Try to use DATABASE_URL if available
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    console.log("Found DATABASE_URL, attempting to execute migration...\n");
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log("✓ Connected to database");

      // Execute the migration SQL
      await client.query(migrationSQL);
      console.log("✓ Migration executed successfully!");

      await client.end();
      return;
    } catch (error) {
      console.error("Error executing migration:", error);
      await client.end();
      throw error;
    }
  } else {
    console.log(
      "DATABASE_URL not found. Please run migration manually or set DATABASE_URL in .env.local\n"
    );
  }
}

runMigration().catch(console.error);
