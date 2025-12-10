#!/usr/bin/env node

/**
 * Delete bad notification token keys from Redis
 * Usage: node scripts/delete-bad-notification-keys.js <path-to-json-file>
 * Example: node scripts/delete-bad-notification-keys.js scripts/bad-notification-keys-1234567890.json
 * 
 * This script:
 * 1. Reads a JSON file containing bad notification keys
 * 2. Extracts FIDs from the keys
 * 3. Deletes each key using deleteUserNotificationDetails
 */

const fs = require("fs");
const path = require("path");
const jiti = require("jiti")(__filename);

require("dotenv").config();

/**
 * Parse FID from a Redis key
 * Format: beamr:miniapp:user:${fid}
 */
function parseFidFromKey(key) {
  const match = key.match(/^beamr:miniapp:user:(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Main function
 */
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Error: File path is required");
    console.error("Usage: node scripts/delete-bad-notification-keys.js <path-to-json-file>");
    console.error("Example: node scripts/delete-bad-notification-keys.js scripts/bad-notification-keys-1234567890.json");
    process.exit(1);
  }

  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`Reading bad keys from: ${fullPath}`);
  console.log("");

  // Read and parse the JSON file
  let badKeys;
  try {
    const fileContent = fs.readFileSync(fullPath, "utf-8");
    badKeys = JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error.message);
    process.exit(1);
  }

  if (!Array.isArray(badKeys)) {
    console.error("Error: JSON file must contain an array of key objects");
    process.exit(1);
  }

  if (badKeys.length === 0) {
    console.log("No keys to delete.");
    return;
  }

  console.log(`Found ${badKeys.length} bad keys to delete`);
  console.log("");

  // Import the delete function using jiti to handle TypeScript
  const notificationsPath = path.join(__dirname, "../lib/notifications.ts");
  const { deleteUserNotificationDetails } = jiti(notificationsPath);

  let deleted = 0;
  let failed = 0;
  const failures = [];

  // Process each bad key
  for (let i = 0; i < badKeys.length; i++) {
    const entry = badKeys[i];
    const key = entry.key;
    let fid = entry.fid;

    // If fid is not in the entry, try to parse it from the key
    if (!fid && key) {
      fid = parseFidFromKey(key);
    }

    if (!fid) {
      console.log(`[${i + 1}/${badKeys.length}] Skipping invalid entry (no FID):`, entry);
      failures.push({ entry, reason: "No FID found" });
      failed++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${badKeys.length}] Deleting FID ${fid} (key: ${key || "N/A"})...`);
      await deleteUserNotificationDetails(fid);
      console.log(`  ✓ Deleted`);
      deleted++;
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      failures.push({ entry, fid, reason: error.message });
      failed++;
    }
  }

  // Output results
  console.log("");
  console.log("=".repeat(50));
  console.log("Summary:");
  console.log(`  Total keys: ${badKeys.length}`);
  console.log(`  Deleted: ${deleted}`);
  console.log(`  Failed: ${failed}`);
  console.log("=".repeat(50));

  if (failures.length > 0) {
    console.log("");
    console.log("Failures:");
    failures.forEach((failure) => {
      console.log(`  - FID ${failure.fid || "N/A"}: ${failure.reason}`);
    });

    // Optionally write failures to a file
    const failureFile = path.join(
      path.dirname(fullPath),
      `delete-failures-${Date.now()}.json`
    );
    fs.writeFileSync(
      failureFile,
      JSON.stringify(failures, null, 2),
      "utf-8"
    );
    console.log("");
    console.log(`Failures written to: ${failureFile}`);
  } else {
    console.log("");
    console.log("All keys deleted successfully!");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
