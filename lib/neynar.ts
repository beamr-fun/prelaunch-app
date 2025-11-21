import { env } from '@/lib/env';
import { getNeynarUsers, setNeynarUsers } from './redis';
import z from 'zod';

export const NeynarUserSchema = z.object({
  fid: z.number(),
  username: z.string(),
  display_name: z.string(),
  pfp_url: z.string(),
  custody_address: z.string(),
  score: z.number(),

  verifications: z.array(z.string()),

  verified_addresses: z.object({
    eth_addresses: z.array(z.string()),
    primary: z.object({
      eth_address: z.string(),
    }),
  }),
});

export type NeynarUser = z.infer<typeof NeynarUserSchema>;

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        'x-api-key': env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      'Failed to fetch Farcaster user on Neynar',
      await response.json()
    );
    throw new Error('Failed to fetch Farcaster user on Neynar');
  }
  const data = await response.json();
  return data.users[0];
};

// export const fetchUsersByEthAddress = async (
//   addresses: string
// ): Promise<Record<string, NeynarUser[]>> => {
//   const response = await fetch(
//     `https://api.neynar.com/v2/farcaster/user/bulk-by-address/?addresses=${addresses}`,
//     {
//       headers: {
//         'x-api-key': env.NEYNAR_API_KEY!,
//       },
//     }
//   );
//   if (!response.ok) {
//     console.error(
//       'Failed to fetch Farcaster users on Neynar',
//       await response.json()
//     );
//     throw new Error('Failed to fetch Farcaster user on Neynar');
//   }
//   const data = await response.json();
//   return data;
// };

export const checkUserFollows = async (
  fid: string,
  targetFid: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${targetFid}&viewer_fid=${fid}`,

      {
        headers: {
          'x-api-key': env.NEYNAR_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      console.error(
        'Failed to fetch user with follow status:',
        await response.json()
      );
      return false;
    }

    const data = await response.json();
    const user = data.users?.[0];

    // Check if the user is following the target (viewer_fid provides this info)
    return user?.viewer_context?.following || false;
  } catch (error) {
    console.error('Error checking user follows:', error);
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
          'x-api-key': env.NEYNAR_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch user channels:', await response.json());
      return false;
    }

    const data = await response.json();
    const channel = data.channels?.[0];

    return channel?.viewer_context?.following || false;
  } catch (error) {
    console.error('Error checking user in channel:', error);
    return false;
  }
};

export const fetchUsers = async (fids: number[]): Promise<NeynarUser[]> => {
  try {
    const cached = await getNeynarUsers(fids);

    const cachedUsers = new Map<number, NeynarUser>();
    const missingFids: number[] = [];

    // Check cache for each FID
    cached.forEach((value, i) => {
      if (value) {
        cachedUsers.set(fids[i], value as NeynarUser);
      } else {
        missingFids.push(fids[i]);

        console.log();
      }
    });

    // log out missing fids
    console.log('Missing FIDs from cache:', missingFids);

    if (missingFids.length) {
      const res = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${missingFids.join(
          ','
        )}`,
        {
          headers: {
            'x-api-key': env.NEYNAR_API_KEY!,
          },
        }
      );

      if (!res.ok) {
        console.error(
          'Failed to fetch Farcaster users on Neynar',
          await res.json()
        );
        throw new Error('Failed to fetch Farcaster users on Neynar');
      }

      const data = (await res.json()) as { users: unknown[] };
      const users = data.users ?? [];

      const validUsers = users
        .map((u) => NeynarUserSchema.safeParse(u))
        .filter((r): r is z.SafeParseSuccess<NeynarUser> => r.success)
        .map((r) => r.data);

      await setNeynarUsers(validUsers);
      for (const user of validUsers) {
        cachedUsers.set(user.fid, user);
      }
    }

    return fids
      .map((fid) => cachedUsers.get(fid))
      .filter((user): user is NeynarUser => {
        return user !== undefined;
      });
  } catch (error) {
    console.error('Error fetching users from Neynar <fetchUsers>:', error);
    throw error;
  }
};
