import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
let envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Checking Supabase Configuration...");
console.log("URL:", supabaseUrl ? "FOUND (" + supabaseUrl + ")" : "MISSING");
console.log("Key:", supabaseAnonKey ? "FOUND (starts with " + supabaseAnonKey.substring(0, 15) + "...)" : "MISSING");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("\n❌ Supabase is NOT fully configured in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log("\nTesting connection to Supabase database...");
    const { data, error } = await supabase.from("meal_plans").select("count").limit(1);

    if (error) {
      console.error("❌ Connection failed or table missing:", error.message);
      if (error.code === "PGRST301" || error.message.includes("relation \"public.meal_plans\" does not exist") || error.code === "42P01") {
        console.error("\n💡 HINT: Table 'meal_plans' does not exist yet in your Supabase project!");
        console.error("Please run the contents of 'supabase/schema.sql' in your Supabase Dashboard -> SQL Editor.");
      }
    } else {
      console.log("\n✅ SUCCESS! Supabase is CONNECTED and table 'meal_plans' is ready!");
    }
  } catch (err) {
    console.error("❌ Exception during connection test:", err.message);
  }
}

testConnection();
