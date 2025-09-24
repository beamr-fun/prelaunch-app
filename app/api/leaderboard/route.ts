import { NextResponse } from "next/server";

export interface LeaderboardEntry {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  points: number;
  rank: number;
}

// Mock data for now - will eventually fetch from neynar API
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    fid: "1",
    username: "vitalik",
    displayName: "Vitalik Buterin",
    pfpUrl: "https://warpcast.com/~/api/avatar/vitalik.eth",
    points: 1250,
    rank: 1,
  },
  {
    fid: "2",
    username: "dwr",
    displayName: "Dan Romero",
    pfpUrl: "https://warpcast.com/~/api/avatar/dwr.eth",
    points: 980,
    rank: 2,
  },
  {
    fid: "3",
    username: "jessepollak",
    displayName: "Jesse Pollak",
    pfpUrl: "https://warpcast.com/~/api/avatar/jessepollak.eth",
    points: 875,
    rank: 3,
  },
  {
    fid: "4",
    username: "sarah",
    displayName: "Sarah Chen",
    pfpUrl: "https://warpcast.com/~/api/avatar/sarah.eth",
    points: 742,
    rank: 4,
  },
  {
    fid: "5",
    username: "mike",
    displayName: "Mike Johnson",
    pfpUrl: "https://warpcast.com/~/api/avatar/mike.eth",
    points: 691,
    rank: 5,
  },
  {
    fid: "6",
    username: "alex",
    displayName: "Alex Rodriguez",
    pfpUrl: "https://warpcast.com/~/api/avatar/alex.eth",
    points: 634,
    rank: 6,
  },
  {
    fid: "7",
    username: "emma",
    displayName: "Emma Wilson",
    pfpUrl: "https://warpcast.com/~/api/avatar/emma.eth",
    points: 587,
    rank: 7,
  },
  {
    fid: "8",
    username: "david",
    displayName: "David Kim",
    pfpUrl: "https://warpcast.com/~/api/avatar/david.eth",
    points: 543,
    rank: 8,
  },
  {
    fid: "9",
    username: "lisa",
    displayName: "Lisa Zhang",
    pfpUrl: "https://warpcast.com/~/api/avatar/lisa.eth",
    points: 498,
    rank: 9,
  },
  {
    fid: "10",
    username: "tom",
    displayName: "Tom Anderson",
    pfpUrl: "https://warpcast.com/~/api/avatar/tom.eth",
    points: 456,
    rank: 10,
  },
];

export async function GET() {
  try {
    // TODO: Eventually replace with actual data fetching from neynar API
    // const addresses = await getLeaderboardAddresses(); // Get from your database
    // const userData = await fetchUsersByEthAddress(addresses.join(','));

    return NextResponse.json({
      success: true,
      data: mockLeaderboardData,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
