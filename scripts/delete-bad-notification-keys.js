#!/usr/bin/env node

/**
 * Delete bad notification token keys from Redis
 * Usage: node scripts/delete-bad-notification-keys.js
 * 
 * This script:
 * 1. Pulls invalid tokens from Redis keys matching beamr:miniapp:invalidtokens:*
 * 2. Maps tokens to FIDs by checking all user notification details
 * 3. Deletes each user notification key using deleteUserNotificationDetails
 * 4. Deletes the invalid token list keys from Redis
 */

const jiti = require("jiti")(__filename);
const path = require("path");

require("dotenv").config();

/**
 * Main function
 */
async function main() {
  // Import required modules
  const redisPath = path.join(__dirname, "../lib/redis.ts");
  const { redis } = jiti(redisPath);

  const notificationsPath = path.join(__dirname, "../lib/notifications.ts");
  const { deleteUserNotificationDetails } = jiti(notificationsPath);

  if (!redis) {
    console.error("Error: Redis client is not initialized");
    console.error("Please ensure REDIS_URL and REDIS_TOKEN environment variables are set");
    process.exit(1);
  }

  console.log("Fetching invalid token lists from Redis...");
  console.log("");

  // Scan for all keys matching beamr:miniapp:invalidtokens:*
  const invalidTokenKeys = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "beamr:miniapp:invalidtokens:*",
      count: 100,
    });

    cursor = nextCursor;
    invalidTokenKeys.push(...keys);
  } while (cursor !== "0");

  if (invalidTokenKeys.length === 0) {
    console.log("No invalid token keys found in Redis.");
    return;
  }

  console.log(`Found ${invalidTokenKeys.length} invalid token key(s)`);
  console.log("");

  // Get all invalid token lists
  const invalidTokenLists = await redis.mget(invalidTokenKeys);
  
  // Collect all unique invalid tokens
  const invalidTokensSet = new Set();
  for (const tokenList of invalidTokenLists) {
    if (Array.isArray(tokenList)) {
      tokenList.forEach((token) => {
        if (typeof token === "string") {
          invalidTokensSet.add(token);
        }
      });
    }
  }

  const invalidTokens = Array.from(invalidTokensSet);

  if (invalidTokens.length === 0) {
    console.log("No invalid tokens found in the lists.");
    return;
  }

  console.log(`Found ${invalidTokens.length} unique invalid token(s)`);
  console.log("");

  // Get all user notification details to map tokens to FIDs
  console.log("Fetching all user notification details to map tokens to FIDs...");

  // Scan for all user notification keys
  const allKeys = [];
  cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "beamr:miniapp:user:*",
      count: 100,
    });

    cursor = nextCursor;
    allKeys.push(...keys);
  } while (cursor !== "0");

  if (allKeys.length === 0) {
    console.log("No user notification details found.");
    return;
  }

  console.log(`Found ${allKeys.length} user notification detail(s)`);
  console.log("");

  // Get all notification details
  const allDetails = await redis.mget(allKeys);

  console.log('allDetails length', allDetails)

  // Create token to FID mapping
  const tokenToFidMap = new Map();
  for (let i = 0; i < allKeys.length; i++) {
    const key = allKeys[i];
    const details = allDetails[i];
    
    if (details && details.token) {
      const fidMatch = key.match(/^beamr:miniapp:user:(\d+)$/);
      if (fidMatch) {
        const fid = parseInt(fidMatch[1], 10);
        tokenToFidMap.set(details.token, fid);
      }
    }
  }

  // Find FIDs for invalid tokens
  const fidToDelete = new Set();

  for (const invalidToken of invalidTokens) {
    const fid = tokenToFidMap.get(invalidToken);
    if (fid) {
      fidToDelete.add(fid);
    }
  }

  const fidsToDelete = Array.from(fidToDelete);

  if (fidsToDelete.length === 0) {
    console.log("No matching FIDs found for invalid tokens.");
    return;
  }

  console.log(`Found ${fidsToDelete.length} FID(s) to delete`);
  console.log("");

  // Delete notification details for each FID
  let deleted = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < fidsToDelete.length; i++) {
    const fid = fidsToDelete[i];

    try {
      console.log(`[${i + 1}/${fidsToDelete.length}] Deleting FID ${fid}...`);
      await deleteUserNotificationDetails(fid);
      console.log(`  ✓ Deleted`);
      deleted++;
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      failures.push({ fid, reason: error.message });
      failed++;
    }
  }

  // Delete the invalid token lists from Redis
  console.log("");
  console.log(`Deleting ${invalidTokenKeys.length} invalid token list key(s) from Redis...`);
  let deletedTokenKeys = 0;
  let failedTokenKeys = 0;

  for (let i = 0; i < invalidTokenKeys.length; i++) {
    const key = invalidTokenKeys[i];
    try {
      await redis.del(key);
      deletedTokenKeys++;
    } catch (error) {
      console.log(`  ✗ Failed to delete ${key}: ${error.message}`);
      failedTokenKeys++;
    }
  }

  if (deletedTokenKeys > 0) {
    console.log(`  ✓ Deleted ${deletedTokenKeys} invalid token list key(s)`);
  }

  // Output results
  console.log("");
  console.log("=".repeat(50));
  console.log("Summary:");
  console.log(`  Invalid token keys found: ${invalidTokenKeys.length}`);
  console.log(`  Unique invalid tokens: ${invalidTokens.length}`);
  console.log(`  FIDs to delete: ${fidsToDelete.length}`);
  console.log(`  User records deleted: ${deleted}`);
  console.log(`  User records failed: ${failed}`);
  console.log(`  Invalid token list keys deleted: ${deletedTokenKeys}`);
  console.log(`  Invalid token list keys failed: ${failedTokenKeys}`);
  console.log("=".repeat(50));

  if (failures.length > 0) {
    console.log("");
    console.log("Failures:");
    failures.forEach((failure) => {
      console.log(`  - FID ${failure.fid}: ${failure.reason}`);
    });
  } else {
    console.log("");
    console.log("All keys deleted successfully!");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
