import { env } from "@/lib/env";
import { getNeynarUser, setNeynarUser } from "@/lib/redis";

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

export const fetchUsers = async (fids: string[]): Promise<NeynarUser[]> => {
  const cachedUsers = new Map<string, NeynarUser>();
  const missingFids: string[] = [];

  // Check cache for each FID
  for (const fid of fids) {
    const cached = await getNeynarUser(fid);
    if (cached) {
      cachedUsers.set(fid, cached as NeynarUser);
    } else {
      missingFids.push(fid);
    }
  }

  // Fetch missing FIDs from Neynar API
  if (missingFids.length > 0) {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${missingFids.join(",")}`,
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
      throw new Error("Failed to fetch Farcaster users on Neynar");
    }
    const data = await response.json();
    const users = data.users || [];

    // Cache the newly fetched users
    for (const user of users) {
      if (user.fid) {
        await setNeynarUser(user.fid, user);
        cachedUsers.set(user.fid, user);
      }
    }
  }

  // Return users in the same order as input FIDs
  return fids
    .map((fid) => cachedUsers.get(fid))
    .filter((user): user is NeynarUser => user !== undefined);
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
