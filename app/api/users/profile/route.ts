import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkUserFollows, checkUserInChannel } from "@/lib/neynar";
import {
  awardFollowPoints,
  awardChannelJoinPoints,
  awardAppAddPoints,
  getUserPoints,
  getUserTotalPoints,
} from "@/lib/points-utils";
import { BEAMR_ACCOUNT_FID, BEAMR_CHANNEL_NAME } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // Get FID from authentication middleware
    const fid = request.headers.get("x-user-fid");
    if (!fid) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get miniapp addition status from query parameter
    const { searchParams } = new URL(request.url);
    const miniAppAdded = searchParams.get("miniAppAdded") === "true";

    // Get user from Supabase
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", parseInt(fid))
      .single();

    if (getUserError || !user) {
      if (getUserError?.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("Error fetching user:", getUserError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    // Check social status and award points automatically
    const awardedPoints = {
      follow: false,
      channelJoin: false,
      appAdd: false,
    };

    try {
      // Check if user follows BEAMR account
      const isFollowing = await checkUserFollows(
        fid,
        BEAMR_ACCOUNT_FID.toString()
      );

      console.log("isFollowing", isFollowing);
      if (isFollowing) {
        awardedPoints.follow = await awardFollowPoints(user.id);
      }

      // Check if user is in BEAMR channel
      const isInChannel = await checkUserInChannel(fid, BEAMR_CHANNEL_NAME);
      if (isInChannel) {
        awardedPoints.channelJoin = await awardChannelJoinPoints(user.id);
      }

      // Check if user has added the miniapp
      if (miniAppAdded) {
        awardedPoints.appAdd = await awardAppAddPoints(user.id);
      }
    } catch (error) {
      console.error("Error checking social status:", error);
      // Continue execution even if social checks fail
    }

    // Get user's total points and transaction history
    const [totalPoints, transactions] = await Promise.all([
      getUserTotalPoints(user.id),
      getUserPoints(user.id),
    ]);

    // Get recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10);

    return NextResponse.json({
      fid: user.fid,
      walletAddress: user.preferred_wallet,
      totalPoints: totalPoints,
      referrerFid: user.referrer_fid,
      walletConfirmed: !!user.preferred_wallet,
      createdAt: user.created_at,
      lastUpdated: user.updated_at,
      transactions: recentTransactions,
      socialStatus: {
        following: awardedPoints.follow,
        inChannel: awardedPoints.channelJoin,
        appAdded: miniAppAdded,
      },
      newlyAwardedPoints: {
        follow: awardedPoints.follow,
        channelJoin: awardedPoints.channelJoin,
        appAdd: awardedPoints.appAdd,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
