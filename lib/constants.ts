// Mock launch date (30 days from now)
export const getLaunchDate = () => {
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  return launchDate;
};

// Point values configuration
export const POINT_VALUES = {
  WALLET_CONFIRMATION: 150,
  FOLLOW: 100,
  CHANNEL_JOIN: 100,
  REFERRAL_BONUS: 100, // Bonus for the referrer
  APP_ADD: 100,
  CAST: 100,
  FRAME_ADD: 100,
} as const;

export const BEAMR_ACCOUNT_FID = 1149437;
export const BEAMR_CHANNEL_NAME = "beamr";
