import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Get user's total points
    const { data: userWithPoints, error: pointsError } = await supabase
      .from("user_points_total")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get user's transaction history
    const { data: transactions, error: transactionsError } = await supabase
      .from("points")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
    }

    const totalPoints = userWithPoints?.total_points || 0;

    return NextResponse.json({
      fid: user.fid,
      walletAddress: user.preferred_wallet,
      totalPoints: totalPoints,
      referrerFid: user.referrer_fid,
      walletConfirmed: !!user.preferred_wallet,
      createdAt: user.created_at,
      lastUpdated: user.updated_at,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
