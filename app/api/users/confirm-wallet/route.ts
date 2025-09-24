import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { POINT_VALUES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, referrerFid } = body;

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

    // If there's a referrer, award referral points
    let referralTransaction = null;
    const finalReferrerFid = referrerFid || user.referrer_fid;

    if (finalReferrerFid) {
      // // Award points to the new user for being referred
      // const { error: userReferralError } = await supabase
      //   .from("points")
      //   .insert({
      //     user_id: user.id,
      //     amount: POINT_VALUES.REFERRAL,
      //     source: "referral",
      //     metadata: { description: `Referred by ${finalReferrerFid}` },
      //     created_at: new Date().toISOString(),
      //   });

      // if (userReferralError) {
      //   console.error("Error adding user referral points:", userReferralError);
      // }

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
      awardedPoints: {
        walletConfirmation: POINT_VALUES.WALLET_CONFIRMATION,
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
