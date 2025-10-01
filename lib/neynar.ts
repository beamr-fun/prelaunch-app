import { env } from "@/lib/env";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    primary: {
      eth_address: string;
    };
  };
}

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster user on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data.users[0];
};

export const fetchUsersByEthAddress = async (
  addresses: string
): Promise<Record<string, NeynarUser[]>> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk-by-address/?addresses=${addresses}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster users on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data;
};

export const checkUserFollows = async (
  fid: string,
  targetFid: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${targetFid}&viewer_fid=${fid}`,

      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch user with follow status:",
        await response.json()
      );
      return false;
    }

    const data = await response.json();
    const user = data.users?.[0];

    // Check if the user is following the target (viewer_fid provides this info)
    return user?.viewer_context?.following || false;
  } catch (error) {
    console.error("Error checking user follows:", error);
    return false;
  }
};

export const checkUserInChannel = async (
  fid: string,
  channelName: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/channel/search?q=${channelName}&viewer_fid=${fid}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch user channels:", await response.json());
      return false;
    }

    const data = await response.json();
    const channel = data.channels?.[0];

    return channel?.viewer_context?.following || false;
  } catch (error) {
    console.error("Error checking user in channel:", error);
    return false;
  }
};
