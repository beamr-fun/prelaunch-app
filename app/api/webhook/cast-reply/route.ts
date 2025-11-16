import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase-server";
import { POINT_VALUES, BEAMR_ACCOUNT_FID } from "@/lib/constants";
import { createHmac } from "crypto";

interface User {
  object: "user";
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: any;
  follower_count: number;
  following_count: number;
  verifications: string[];
  active_status: string;
}

interface ParentAuthor {
  fid: number | null;
}

export interface WebhookCastCreated {
  data: {
    object: "cast";
    hash: string;
    thread_hash: string;
    parent_hash: string | null;
    parent_url: string | null;
    root_parent_url: string | null;
    parent_author: ParentAuthor;
    author: User;
    text: string;
    timestamp: string;
    embeds: any[];
    reactions: any;
    replies: any;
    mentioned_profiles: any[];
  };
  type: "cast.created";
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
    const webhookData: WebhookCastCreated = JSON.parse(body);

    console.log("Webhook data:", webhookData);

    // Validate webhook structure
    if (
      !webhookData.data ||
      !webhookData.data.author ||
      !webhookData.data.parent_author
    ) {
      return NextResponse.json(
        { error: "Invalid webhook data structure" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { author, parent_author, text } = webhookData.data;
    const authorFid = author.fid;
    const parentFid = parent_author.fid;

    if (!authorFid || !parentFid) {
      return NextResponse.json(
        { error: "Missing required fields: authorFid, parentFid" },
        { status: 400 }
      );
    }

    // Only process cast.created actions
    if (webhookData.type !== "cast.created") {
      return NextResponse.json(
        { error: "Only cast.created events are supported" },
        { status: 400 }
      );
    }

    // Check that the cast is coming from the beamr account
    if (authorFid !== BEAMR_ACCOUNT_FID) {
      return NextResponse.json(
        { error: "Cast not from beamr account" },
        { status: 400 }
      );
    }

    // Check that the message includes the hashtag '#beamrsup'
    if (!text.includes("#beamrsup")) {
      return NextResponse.json(
        { error: "Cast does not contain required hashtag #beamrsup" },
        { status: 400 }
      );
    }

    // Get or create user in Supabase (using parent_author's fid)
    const supabase = supabaseClient();
    const { data: existingUser, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", parentFid)
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
          fid: parentFid,
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

    // Extract points amount from cast text (look for number after #beamrsup)
    let pointsAmount: number = POINT_VALUES.CAST;
    const hashtagMatch = text.match(/#beamrsup\s*(\d+)/i);
    if (hashtagMatch && hashtagMatch[1]) {
      const extractedPoints = parseInt(hashtagMatch[1], 10);
      if (!isNaN(extractedPoints) && extractedPoints > 0) {
        pointsAmount = extractedPoints;
      }
    }

    // Award points for cast reply
    const { data: castTransaction, error: pointsError } = await supabase
      .from("points")
      .insert({
        user_id: user.id,
        fid: parentFid,
        amount: pointsAmount,
        source: "cast",
        metadata: {
          description: `Received reply from @beamr with #beamrsup (${pointsAmount} points)`,
          cast_hash: webhookData.data.hash,
          author_username: author.username,
          extracted_points: pointsAmount,
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pointsError) {
      console.error("Error adding cast points:", pointsError);
      return NextResponse.json(
        { error: "Failed to award cast points" },
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
      awardedPoints: pointsAmount,
      transaction: castTransaction,
      transactions: recentTransactions || [],
      message: `Cast reply points awarded successfully (${pointsAmount} points)`,
    });
  } catch (error) {
    console.error("Error processing cast reply webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
