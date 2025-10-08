import { supabaseServer as supabase } from "@/lib/supabase-server";
import { POINT_VALUES } from "@/lib/constants";

export type PointSource =
  | "follow"
  | "channel_join"
  | "wallet_confirmation"
  | "app_add"
  | "referral"
  | "cast";

export interface PointRecord {
  id: string;
  user_id: string | null;
  source: string;
  amount: number;
  metadata?: any;
  created_at: string | null;
}

/**
 * Check if a point record already exists for a user and source
 */
export const checkExistingPoint = async (
  userId: string,
  source: PointSource
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("points")
      .select("id")
      .eq("user_id", userId)
      .eq("source", source)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking existing point:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking existing point:", error);
    return false;
  }
};

/**
 * Insert a new point record if it doesn't already exist
 */
export const insertPointRecord = async (
  userId: string,
  source: PointSource,
  amount: number,
  metadata?: any
): Promise<boolean> => {
  try {
    // Check if point already exists
    const exists = await checkExistingPoint(userId, source);
    if (exists) {
      console.log(
        `Point record already exists for user ${userId} and source ${source}`
      );
      return true;
    }

    // Insert new point record
    const { error } = await supabase.from("points").insert({
      user_id: userId,
      source,
      amount,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting point record:", error);
      return false;
    }

    console.log(
      `Successfully inserted point record: ${source} for user ${userId}`
    );
    return true;
  } catch (error) {
    console.error("Error inserting point record:", error);
    return false;
  }
};

/**
 * Get all points for a user
 */
export const getUserPoints = async (userId: string): Promise<PointRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("points")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user points:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching user points:", error);
    return [];
  }
};

/**
 * Get total points for a user
 */
export const getUserTotalPoints = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("user_points_total")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user total points:", error);
      return 0;
    }

    return data?.total_points || 0;
  } catch (error) {
    console.error("Error fetching user total points:", error);
    return 0;
  }
};

/**
 * Award points for following BEAMR account
 */
export const awardFollowPoints = async (userId: string): Promise<boolean> => {
  return await insertPointRecord(userId, "follow", POINT_VALUES.FOLLOW, {
    description: "Followed BEAMR account",
  });
};

/**
 * Award points for joining BEAMR channel
 */
export const awardChannelJoinPoints = async (
  userId: string
): Promise<boolean> => {
  return await insertPointRecord(
    userId,
    "channel_join",
    POINT_VALUES.CHANNEL_JOIN,
    { description: "Joined BEAMR channel" }
  );
};

/**
 * Award points for adding the miniapp
 */
export const awardAppAddPoints = async (userId: string): Promise<boolean> => {
  return await insertPointRecord(userId, "app_add", POINT_VALUES.APP_ADD, {
    description: "Added BEAMR miniapp",
  });
};

/**
 * Award points for wallet confirmation
 */
export const awardWalletConfirmationPoints = async (
  userId: string
): Promise<boolean> => {
  return await insertPointRecord(
    userId,
    "wallet_confirmation",
    POINT_VALUES.WALLET_CONFIRMATION,
    { description: "Wallet confirmation bonus" }
  );
};

/**
 * Award referral bonus points
 */
export const awardReferralBonusPoints = async (
  userId: string,
  referredFid: string
): Promise<boolean> => {
  return await insertPointRecord(
    userId,
    "referral",
    POINT_VALUES.REFERRAL_BONUS,
    { description: `Referral bonus for ${referredFid}` }
  );
};

/**
 * Delete a point record if it exists
 */
export const deletePointRecord = async (
  fid: string,
  source: PointSource
): Promise<boolean> => {
  try {
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", parseInt(fid))
      .single();

    if (getUserError) {
      console.error("Error deleting point record, getUserError:", getUserError);
      return false;
    }

    // Check if point exists first
    const exists = await checkExistingPoint(user.id, source);
    if (!exists) {
      console.log(
        `No point record found for user ${user.id} and source ${source}`
      );
      return false;
    }

    // Delete the point record
    const { error } = await supabase
      .from("points")
      .delete()
      .eq("user_id", user.id)
      .eq("source", source);

    if (error) {
      console.error("Error deleting point record:", error);
      return false;
    }

    console.log(
      `Successfully deleted point record: ${source} for user ${user.id}`
    );
    return true;
  } catch (error) {
    console.error("Error deleting point record:", error);
    return false;
  }
};

/**
 * Check if user has CAST points
 */
export const hasCastPoints = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("points")
      .select("id")
      .eq("user_id", userId)
      .eq("source", "cast")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking CAST points:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking CAST points:", error);
    return false;
  }
};

/**
 * Check if user has referral bonus points
 */
export const hasReferred = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("points")
      .select("id")
      .eq("user_id", userId)
      .eq("source", "referral")
      .limit(1);

    if (error) {
      console.error("Error checking referral points:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking referral points:", error);
    return false;
  }
};
