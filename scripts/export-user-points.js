#!/usr/bin/env node

/**
 * Export user points report as CSV
 * Usage: node scripts/export-user-points.js <FID>
 * Example: node scripts/export-user-points.js 12345
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: Missing required environment variables");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const fid = process.argv[2];

if (!fid) {
  console.error("Error: FID is required");
  console.error("Usage: node scripts/export-user-points.js <FID>");
  console.error("Example: node scripts/export-user-points.js 12345");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function exportUserPoints(fid) {
  const { data, error } = await supabase
    .from("user_points_report")
    .select("*")
    .eq("fid", fid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching points:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error(`No points found for FID: ${fid}`);
    process.exit(1);
  }

  // Generate CSV header
  const headers = Object.keys(data[0]);
  console.log(headers.join(","));

  // Generate CSV rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle null, undefined, and stringify objects
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "object") {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    console.log(values.join(","));
  });

  console.error(`\nExported ${data.length} records for FID: ${fid}`);
}

exportUserPoints(fid);
