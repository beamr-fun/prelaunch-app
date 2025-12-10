#!/usr/bin/env node

/**
 * Test notification tokens by sending test notifications
 * Usage: node scripts/test-notification-tokens.js
 * 
 * This script:
 * 1. Pulls all user notification details from Redis
 * 2. Parses FIDs from keys
 * 3. Makes POST requests to api/notify for each FID
 * 4. Tracks bad tokens (keys that fail)
 * 5. Outputs bad keys to a file
 */

const { Redis } = require("@upstash/redis");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL;
const REDIS_TOKEN = process.env.REDIS_TOKEN;
const API_URL = process.env.API_URL || "https://app.beamr.fun";
const NOTIFICATION_SERVICE_KEY = "beamr:miniapp";

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error("Error: Missing required environment variables");
  console.error("Required: REDIS_URL and REDIS_TOKEN");
  process.exit(1);
}

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

/**
 * Parse FID from a Redis key
 * Format: beamr:miniapp:user:${fid}
 */
function parseFidFromKey(key) {
  const match = key.match(/^beamr:miniapp:user:(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Get all user notification keys from Redis
 */
async function getAllUserNotificationKeys() {
  const allKeys = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${NOTIFICATION_SERVICE_KEY}:user:*`,
      count: 100,
    });

    cursor = nextCursor;
    allKeys.push(...keys);
  } while (cursor !== "0");

  return allKeys;
}

/**
 * Send a test notification for a given FID
 */
async function sendTestNotification(fid, notificationDetails) {
  try {
    const response = await fetch(`${API_URL}/api/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fid,
        notification: {
          title: "Test Notification",
          body: "This is a test notification",
          notificationDetails,
        },
      }),
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      error: response.ok ? null : await response.text().catch(() => "Unknown error"),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: "Network Error",
      error: error.message,
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log("Starting notification token test...");
  console.log(`API URL: ${API_URL}`);
  console.log("");

  // Get all keys
  console.log("Fetching all user notification keys from Redis...");
  const keys = await getAllUserNotificationKeys();
  console.log(`Found ${keys.length} keys`);

  const badKeys = [];
  let processed = 0;
  let successCount = 0;
  let failureCount = 0;

  // Process each key
  for (const key of keys) {
    processed++;
    const fid = parseFidFromKey(key);

    if (!fid) {
      console.log(`[${processed}/${keys.length}] Skipping invalid key: ${key}`);
      badKeys.push({ key, reason: "Invalid key format" });
      failureCount++;
      continue;
    }

    const notificationContent = {
      title: 'some title',
      body: 'some body'
    }

    // Send test notification
    console.log(`[${processed}/${keys.length}] Testing FID ${fid}...`);
    const result = await sendTestNotification(fid, notificationContent);

    if (result.ok) {
      console.log(`  ✓ Success`);
      successCount++;
    } else {
      console.log(`  ✗ Failed: ${result.status} ${result.statusText}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      badKeys.push({
        key,
        fid,
        reason: `HTTP ${result.status}: ${result.statusText}`,
        error: result.error,
      });
      failureCount++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Output results
  console.log("");
  console.log("=".repeat(50));
  console.log("Summary:");
  console.log(`  Total keys: ${keys.length}`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Failed: ${failureCount}`);
  console.log("=".repeat(50));

  // Write bad keys to file
  if (badKeys.length > 0) {
    const fs = require("fs");
    const path = require("path");
    const outputFile = path.join(
      __dirname,
      `bad-notification-keys-${Date.now()}.json`
    );

    fs.writeFileSync(
      outputFile,
      JSON.stringify(badKeys, null, 2),
      "utf-8"
    );

    console.log("");
    console.log(`Bad keys written to: ${outputFile}`);
    console.log(`Total bad keys: ${badKeys.length}`);
  } else {
    console.log("");
    console.log("No bad keys found! All tokens are valid.");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
