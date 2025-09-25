// Mock launch date (30 days from now)
export const getLaunchDate = () => {
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  return launchDate;
};

// Point values configuration
export const POINT_VALUES = {
  WALLET_CONFIRMATION: 250,
  FOLLOW: 100,
  CHANNEL_JOIN: 150,
  REFERRAL_BONUS: 100, // Bonus for the referrer
} as const;

export const BEAMR_ACCOUNT_FID = 1149437;
