"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useUser } from "./user-context";
import {
  getReferralFromURL,
  setReferralCode,
  getReferralCode,
} from "@/lib/storage";

export interface UserPoints {
  fid: string;
  walletAddress?: string;
  totalPoints: number;
  referrerFid?: string;
  walletConfirmed: boolean;
  createdAt: string;
  lastUpdated: string;
  transactions: any[];
  socialStatus: {
    following: boolean;
    inChannel: boolean;
    appAdded: boolean;
    hasCast: boolean;
    hasReferred: boolean;
  };
  newlyAwardedPoints: {
    follow: boolean;
    channelJoin: boolean;
    appAdd: boolean;
  };
}

export interface PointsState {
  userPoints: UserPoints | null;
  isLoading: boolean;
  error: string | null;
  referrerFid?: string;
}

interface PointsContextType extends PointsState {
  confirmWallet: (walletAddress: string) => Promise<void>;
  setReferrerFid: (fid: string) => void;
  refetchPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

interface PointsProviderProps {
  children: ReactNode;
}

export function PointsProvider({ children }: PointsProviderProps) {
  const { user } = useUser();
  const [state, setState] = useState<PointsState>({
    userPoints: null,
    isLoading: false,
    error: null,
    referrerFid: undefined,
  });

  const fetchUserProfile = async (): Promise<UserPoints | undefined> => {
    try {
      const context = await sdk.context;
      const miniAppAdded = context?.client?.added;

      // Pass miniapp status as query parameter
      const url = `/api/users/profile${
        miniAppAdded ? "?miniAppAdded=true" : ""
      }`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log("user points fetch data", data);
      return {
        fid: data.fid,
        walletAddress: data.walletAddress,
        totalPoints: data.totalPoints,
        referrerFid: data.referrerFid,
        walletConfirmed: data.walletConfirmed,
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated,
        transactions: data.transactions || [],
        socialStatus: data.socialStatus || {
          following: false,
          inChannel: false,
          appAdded: false,
          hasCast: false,
          hasReferred: false,
        },
        newlyAwardedPoints: data.newlyAwardedPoints || {
          follow: false,
          channelJoin: false,
          appAdd: false,
        },
      };
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  };

  const confirmWalletAPI = async (
    walletAddress: string
  ): Promise<UserPoints> => {
    try {
      const context = await sdk.context;
      const miniAppAdded = context?.client?.added;
      const response = await fetch("/api/users/confirm-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          referrerFid: state.referrerFid,
          miniAppAdded,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        fid: data.fid,
        walletAddress: data.walletAddress,
        totalPoints: data.totalPoints,
        referrerFid: data.referrerFid,
        walletConfirmed: data.walletConfirmed,
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated,
        transactions: data.transactions || [],
        socialStatus: data.socialStatus || {
          following: false,
          inChannel: false,
          appAdded: false,
          hasCast: false,
          hasReferred: false,
        },
        newlyAwardedPoints: data.newlyAwardedPoints || {
          follow: false,
          channelJoin: false,
          appAdd: false,
        },
      };
    } catch (error) {
      console.error("Failed to confirm wallet:", error);
      throw error;
    }
  };

  // Load points when user is authenticated
  useEffect(() => {
    const loadPoints = async () => {
      if (!user.data) {
        setState((prev) => ({
          ...prev,
          userPoints: null,
          isLoading: false,
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const userData = await fetchUserProfile();

        console.log("userData", userData);

        // Check for referral code in URL
        const urlReferral = getReferralFromURL();
        if (urlReferral) {
          setReferralCode(urlReferral);
        }

        // Get stored referral code
        const storedReferral = getReferralCode();

        setState((prev) => ({
          ...prev,
          userPoints: userData || null,
          referrerFid: storedReferral || undefined,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Failed to load points:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load points",
        }));
      }
    };

    loadPoints();
  }, [user.data, user.isLoading]);

  const confirmWallet = async (walletAddress: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedUser = await confirmWalletAPI(walletAddress);
      setState((prev) => ({
        ...prev,
        userPoints: updatedUser,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to confirm wallet:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to confirm wallet",
      }));
    }
  };

  const setReferrerFid = (fid: string) => {
    setState((prev) => ({ ...prev, referrerFid: fid }));
  };

  const refetchPoints = async () => {
    if (!user.data) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const userData = await fetchUserProfile();
      setState((prev) => ({
        ...prev,
        userPoints: userData || null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to refetch points:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to refetch points",
      }));
    }
  };

  return (
    <PointsContext.Provider
      value={{
        ...state,
        confirmWallet,
        setReferrerFid,
        refetchPoints,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
}
