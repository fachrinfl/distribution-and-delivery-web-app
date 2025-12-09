import { createClient } from "@supabase/supabase-js";

// Use environment variables or provide dummy values for build time
// Supabase client requires non-empty strings, so we provide minimal valid-looking values
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Validate at runtime when actually used
if (typeof window !== "undefined") {
  const actualUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const actualKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !actualUrl ||
    !actualKey ||
    actualUrl.includes("placeholder") ||
    actualKey.includes("placeholder")
  ) {
    console.error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
    );
  }
}
