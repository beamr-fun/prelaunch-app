import { NextRequest, NextResponse } from "next/server";
import { mockDB, POINT_VALUES } from "@/lib/mock-db";

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

    // In a real app, you'd get the FID from authentication
    const fid = "12345"; // Mock FID for now

    // Get or create user
    let user = mockDB.getUser(fid);
    if (!user) {
      user = mockDB.createUser(fid, referrerFid);
    }

    // Check if wallet is already confirmed
    if (user.walletAddress) {
      return NextResponse.json(
        { error: "Wallet already confirmed" },
        { status: 400 }
      );
    }

    // Update user with wallet address
    const updatedUser = mockDB.updateUser(fid, {
      walletAddress,
      referrerFid: referrerFid || user.referrerFid,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Award points for wallet confirmation
    const walletTransaction = mockDB.addPoints(
      fid,
      POINT_VALUES.WALLET_CONFIRMATION,
      "wallet_confirmation",
      "Wallet confirmation bonus"
    );

    // If there's a referrer, award referral points
    let referralTransaction = null;
    if (referrerFid || user.referrerFid) {
      const referrer = referrerFid || user.referrerFid;
      if (referrer) {
        // Award points to the new user for being referred
        const userReferralTransaction = mockDB.addPoints(
          fid,
          POINT_VALUES.REFERRAL,
          "referral",
          `Referred by ${referrer}`
        );

        // Award bonus points to the referrer
        const referrerUser = mockDB.getUser(referrer);
        if (referrerUser) {
          referralTransaction = mockDB.addPoints(
            referrer,
            POINT_VALUES.REFERRAL_BONUS,
            "referral",
            `Referral bonus for ${fid}`
          );
        }
      }
    }

    // Get updated user data
    const finalUser = mockDB.getUser(fid);
    const transactions = mockDB.getUserTransactions(fid);

    return NextResponse.json({
      fid: finalUser!.fid,
      walletAddress: finalUser!.walletAddress,
      totalPoints: finalUser!.totalPoints,
      referrerFid: finalUser!.referrerFid,
      walletConfirmed: true,
      lastUpdated: finalUser!.lastUpdated,
      transactions: transactions.slice(-5), // Last 5 transactions
      awardedPoints: {
        walletConfirmation: POINT_VALUES.WALLET_CONFIRMATION,
        referral: referrerFid || user.referrerFid ? POINT_VALUES.REFERRAL : 0,
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
