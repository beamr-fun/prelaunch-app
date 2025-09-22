import { NextRequest, NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the FID from authentication
    // For now, we'll use a mock FID or get it from query params
    const url = new URL(request.url);
    const fid = url.searchParams.get("fid") || "12345";

    // Get user from mock database
    const user = mockDB.getUser(fid);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's transaction history
    const transactions = mockDB.getUserTransactions(fid);

    return NextResponse.json({
      fid: user.fid,
      walletAddress: user.walletAddress,
      totalPoints: user.totalPoints,
      referrerFid: user.referrerFid,
      walletConfirmed: !!user.walletAddress,
      createdAt: user.createdAt,
      lastUpdated: user.lastUpdated,
      transactions: transactions.slice(-10), // Last 10 transactions
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
