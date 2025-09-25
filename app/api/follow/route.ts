import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";
import { POINT_VALUES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, targetFid, action } = body;

    console.log("body", body);

    // Validate required fields
    if (!fid || !targetFid || !action) {
      return NextResponse.json(
        { error: "Missing required fields: fid, targetFid, action" },
        { status: 400 }
      );
    }

    // Only process follow actions
    if (action !== "follow") {
      return NextResponse.json(
        { error: "Only follow actions are supported" },
        { status: 400 }
      );
    }

    // In a real app, you'd verify this is a legitimate webhook from Neynar
    // For now, we'll just check if the target is the Beamer account
    const BEAMER_FID = "12345"; // Mock Beamer FID

    if (targetFid !== BEAMER_FID) {
      return NextResponse.json(
        { error: "Invalid target FID" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = mockDB.getUser(fid);
    if (!user) {
      user = mockDB.createUser(fid);
    }

    // Check if user has already received follow points
    if (mockDB.hasUserAction(fid, "follow")) {
      return NextResponse.json(
        { error: "User has already received follow points" },
        { status: 400 }
      );
    }

    // Award points for following
    const followTransaction = mockDB.addPoints(
      fid,
      POINT_VALUES.FOLLOW,
      "follow",
      "Followed @beamer"
    );

    // Get updated user data
    const updatedUser = mockDB.getUser(fid);
    const transactions = mockDB.getUserTransactions(fid);

    return NextResponse.json({
      success: true,
      fid: updatedUser!.fid,
      totalPoints: updatedUser!.totalPoints,
      awardedPoints: POINT_VALUES.FOLLOW,
      transaction: followTransaction,
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
