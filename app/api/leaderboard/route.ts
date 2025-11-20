import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-server";
import { fetchUsersByEthAddress } from "@/lib/neynar";

export interface LeaderboardEntry {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  points: number;
  rank: number;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Check if request is from mini app
    const isMiniAppValidated = request.headers.get("x-miniapp-validated");
    if (!isMiniAppValidated) {
      return NextResponse.json(
        { error: "Request must be from Farcaster mini app" },
        { status: 403 }
      );
    }

    // Get FID from authentication middleware
    const fid = request.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    // Get top 20 users with their total points from the database
    const supabase = supabaseClient();
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from("user_points_total")
      .select(
        `
        fid,
        total_points,
        user_id
      `
      )
      .order("total_points", { ascending: false })
      .limit(20);

    if (leaderboardError) {
      console.error("Error fetching leaderboard data:", leaderboardError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch leaderboard data" },
        { status: 500 }
      );
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get user IDs to fetch user data with wallet addresses
    const userIds = leaderboardData
      .map((entry) => entry.user_id)
      .filter((id): id is string => id !== null);

    // Fetch user data with wallet addresses
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, fid, preferred_wallet")
      .in("id", userIds)
      .not("preferred_wallet", "is", null); // Only users with confirmed wallets

    if (usersError) {
      console.error("Error fetching users data:", usersError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch users data" },
        { status: 500 }
      );
    }

    if (!usersData || usersData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Create a map of user_id to user data for quick lookup
    const userMap = new Map(usersData.map((user) => [user.id, user]));

    // Filter leaderboard data to only include users with confirmed wallets
    const filteredLeaderboardData = leaderboardData.filter(
      (entry) => entry.user_id && userMap.has(entry.user_id)
    );

    // Get wallet addresses for fetching user data from Neynar
    const walletAddresses = filteredLeaderboardData
      .map((entry) =>
        entry.user_id ? userMap.get(entry.user_id)?.preferred_wallet : null
      )
      .filter(Boolean)
      .join(",");

    // Fetch user data from Neynar API
    const userDataByAddress = await fetchUsersByEthAddress(walletAddresses);

    // Create leaderboard entries with rank
    const leaderboardEntries: LeaderboardEntry[] = filteredLeaderboardData
      .map((entry, index) => {
        const user = entry.user_id ? userMap.get(entry.user_id) : null;
        const walletAddress = user?.preferred_wallet;

        if (!walletAddress || !entry.fid) {
          return null;
        }

        const neynarUsers = userDataByAddress[walletAddress] || [];
        const neynarUser = neynarUsers[0]; // Take the first user if multiple

        if (!neynarUser) {
          console.warn(`No Neynar data found for wallet ${walletAddress}`);
          return null;
        }

        return {
          fid: entry.fid.toString(),
          username: neynarUser.username,
          displayName: neynarUser.display_name,
          pfpUrl: neynarUser.pfp_url,
          points: entry.total_points || 0,
          rank: index + 1,
        };
      })
      .filter(Boolean) as LeaderboardEntry[];

    return NextResponse.json(
      {
        success: true,
        data: leaderboardEntries,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
