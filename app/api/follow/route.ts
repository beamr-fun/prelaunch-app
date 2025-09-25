import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { POINT_VALUES } from "@/lib/constants";
import { createHmac } from "crypto";

interface UserDehydrated {
  fid: number;
  object: "user_dehydrated";
  username: string;
}

export interface WebhookFollowCreated {
  data: {
    event_timestamp: string;
    user: UserDehydrated;
    object: "follow";
    timestamp: string;
    target_user: UserDehydrated;
  };
  type: "follow.created";
  created_at: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const sig = request.headers.get("X-Neynar-Signature");
    if (!sig) {
      throw new Error("Neynar signature missing from request headers");
    }

    const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error(
        "Make sure you set NEYNAR_WEBHOOK_SECRET in your .env file"
      );
    }

    const hmac = createHmac("sha512", webhookSecret);
    hmac.update(body);

    const generatedSignature = hmac.digest("hex");

    const isValid = generatedSignature === sig;
    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    // Parse the webhook body
    const webhookData: WebhookFollowCreated = JSON.parse(body);

    console.log("Webhook data:", webhookData);

    // Validate webhook structure
    if (
      !webhookData.data ||
      !webhookData.data.user ||
      !webhookData.data.target_user
    ) {
      return NextResponse.json(
        { error: "Invalid webhook data structure" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { user: followingUser, target_user: targetUser } = webhookData.data;
    const fid = followingUser.fid;
    const targetFid = targetUser.fid;

    if (!fid || !targetFid) {
      return NextResponse.json(
        { error: "Missing required fields: fid, targetFid" },
        { status: 400 }
      );
    }

    // Only process follow actions
    if (webhookData.type !== "follow.created") {
      return NextResponse.json(
        { error: "Only follow.created events are supported" },
        { status: 400 }
      );
    }

    // Get or create user in Supabase
    const { data: existingUser, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", fid)
      .single();

    if (getUserError && getUserError.code !== "PGRST116") {
      console.error("Error fetching user:", getUserError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      // Create new user without preferred wallet
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          fid: fid,
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

    // Check if user already has points for following
    const { data: existingFollowPoints, error: followPointsError } =
      await supabase
        .from("points")
        .select("*")
        .eq("user_id", user.id)
        .eq("source", "follow")
        .single();

    if (followPointsError && followPointsError.code !== "PGRST116") {
      console.error(
        "Error checking existing follow points:",
        followPointsError
      );
      return NextResponse.json(
        { error: "Failed to check existing follow points" },
        { status: 500 }
      );
    }

    if (existingFollowPoints) {
      return NextResponse.json(
        { error: "User has already received follow points" },
        { status: 400 }
      );
    }

    // Award points for following
    const { data: followTransaction, error: pointsError } = await supabase
      .from("points")
      .insert({
        user_id: user.id,
        amount: POINT_VALUES.FOLLOW,
        source: "follow",
        metadata: { description: "Followed @beamer" },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pointsError) {
      console.error("Error adding follow points:", pointsError);
      return NextResponse.json(
        { error: "Failed to award follow points" },
        { status: 500 }
      );
    }

    // Get updated user data with total points
    const { data: userWithPoints, error: pointsTotalError } = await supabase
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
      success: true,
      fid: user.fid,
      totalPoints: totalPoints,
      awardedPoints: POINT_VALUES.FOLLOW,
      transaction: followTransaction,
      transactions: recentTransactions || [],
      message: "Follow points awarded successfully",
    });
  } catch (error) {
    console.error("Error processing follow webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
