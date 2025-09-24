// Storage utilities for referral code management
const REFERRAL_KEY = "beamer_referral_fid";

export const setReferralCode = (fid: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFERRAL_KEY, fid);
  }
};

export const getReferralCode = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFERRAL_KEY);
  }
  return null;
};

export const clearReferralCode = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFERRAL_KEY);
  }
};

// URL parameter utilities
export const getReferralFromURL = (): string | null => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("ref");
  }
  return null;
};

export const generateReferralURL = (fid: string, baseURL?: string): string => {
  const base =
    baseURL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://app.beamer.com");
  return `${base}/?ref=${fid}`;
};
