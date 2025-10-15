import { NextRequest, NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";
import {
  POINT_VALUES,
  BEAMR_ACCOUNT_FID,
  BEAMR_CHANNEL_NAME,
} from "@/lib/constants";
import { checkUserFollows, checkUserInChannel } from "@/lib/neynar";
import {
  awardFollowPoints,
  awardChannelJoinPoints,
  awardAppAddPoints,
} from "@/lib/points-utils";

export async function POST(request: NextRequest) {
  try {
    // Check if request is from mini app
    const isMiniAppValidated = request.headers.get("x-miniapp-validated");
    if (!isMiniAppValidated) {
      return NextResponse.json(
        { error: "Request must be from Farcaster mini app" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { walletAddress, referrerFid, miniAppAdded } = body;

    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
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

    if (fid === referrerFid) {
      return NextResponse.json(
        { error: "FID and referrer FID match. NO NO!" },
        { status: 400 }
      );
    }

    // Get or create user in Supabase
    const { data: existingUser, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", parseInt(fid))
      .single();

    if (getUserError && getUserError.code !== "PGRST116") {
      console.error("Error fetching user:", getUserError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    // Check if wallet is already confirmed
    if (existingUser?.preferred_wallet) {
      return NextResponse.json(
        { error: "Wallet already confirmed" },
        { status: 400 }
      );
    }

    // Create or update user
    let user;
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          preferred_wallet: walletAddress,
          referrer_fid: referrerFid
            ? parseInt(referrerFid)
            : existingUser.referrer_fid,
          updated_at: new Date().toISOString(),
        })
        .eq("fid", parseInt(fid))
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user:", updateError);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          fid: parseInt(fid),
          preferred_wallet: walletAddress,
          referrer_fid: referrerFid ? parseInt(referrerFid) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      user = newUser;
    }

    // Award points for wallet confirmation
    const { error: walletPointsError } = await supabase.from("points").insert({
      user_id: user.id,
      fid: parseInt(fid),
      amount: POINT_VALUES.WALLET_CONFIRMATION,
      source: "wallet_confirmation",
      metadata: { description: "Wallet confirmation bonus" },
      created_at: new Date().toISOString(),
    });

    if (walletPointsError) {
      console.error(
        "Error adding wallet confirmation points:",
        walletPointsError
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

      if (isFollowing) {
        awardedPoints.follow = await awardFollowPoints(user.id, parseInt(fid));
      }

      // Check if user is in BEAMR channel
      const isInChannel = await checkUserInChannel(fid, BEAMR_CHANNEL_NAME);
      if (isInChannel) {
        awardedPoints.channelJoin = await awardChannelJoinPoints(user.id, parseInt(fid));
      }

      // Check if user has added the miniapp
      if (miniAppAdded) {
        awardedPoints.appAdd = await awardAppAddPoints(user.id, parseInt(fid));
      }
    } catch (error) {
      console.error("Error checking social status:", error);
      // Continue execution even if social checks fail
    }

    // If there's a referrer, award referral points
    let referralTransaction = null;
    const finalReferrerFid = referrerFid || user.referrer_fid;

    if (finalReferrerFid) {
      // Award bonus points to the referrer
      const { data: referrerUser, error: referrerError } = await supabase
        .from("users")
        .select("*")
        .eq("fid", finalReferrerFid)
        .single();

      if (!referrerError && referrerUser) {
        const { error: referrerPointsError } = await supabase
          .from("points")
          .insert({
            user_id: referrerUser.id,
            fid: finalReferrerFid,
            amount: POINT_VALUES.REFERRAL_BONUS,
            source: "referral",
            metadata: { description: `Referral bonus for ${fid}` },
            created_at: new Date().toISOString(),
          });

        if (referrerPointsError) {
          console.error(
            "Error adding referrer bonus points:",
            referrerPointsError
          );
        } else {
          referralTransaction = { amount: POINT_VALUES.REFERRAL_BONUS };
        }
      }
    }

    // Get updated user data with total points
    const { data: userWithPoints, error: pointsError } = await supabase
      .from("user_points_total")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: recentTransactions, error: transactionsError } =
      await supabase
        .from("points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    const totalPoints = userWithPoints?.total_points || 0;

    return NextResponse.json({
      fid: user.fid,
      walletAddress: user.preferred_wallet,
      totalPoints: totalPoints,
      referrerFid: user.referrer_fid,
      walletConfirmed: true,
      lastUpdated: user.updated_at,
      transactions: recentTransactions || [],
      socialStatus: {
        following: awardedPoints.follow,
        inChannel: awardedPoints.channelJoin,
        appAdded: !!miniAppAdded,
      },
      awardedPoints: {
        walletConfirmation: POINT_VALUES.WALLET_CONFIRMATION,
        follow: awardedPoints.follow ? POINT_VALUES.FOLLOW : 0,
        channelJoin: awardedPoints.channelJoin ? POINT_VALUES.CHANNEL_JOIN : 0,
        appAdd: awardedPoints.appAdd ? POINT_VALUES.APP_ADD : 0,
        referrerBonus: referralTransaction ? POINT_VALUES.REFERRAL_BONUS : 0,
      },
    });
  } catch (error) {
    console.error("Error confirming wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
