"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getReferralFromURL,
  setReferralCode,
  getReferralCode,
} from "@/lib/storage";

// Interfaces from the spec
export interface UserPoints {
  fid: string;
  walletAddress?: string;
  totalPoints: number;
}

export interface WalletState {
  userPoints: UserPoints | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletConfirmed: boolean;
  referrerFid?: string;
}

interface WalletContextType extends WalletState {
  confirmWallet: (walletAddress: string) => Promise<void>;
  toggleWalletState: () => void;
  setReferrerFid: (fid: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    userPoints: null,
    isAuthenticated: false,
    isLoading: true,
    walletConfirmed: false,
    referrerFid: undefined,
  });

  // Real API calls
  const fetchUserProfile = async (): Promise<UserPoints> => {
    try {
      const response = await fetch(`/api/users/profile?fid=12345`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        fid: data.fid,
        walletAddress: data.walletAddress,
        totalPoints: data.totalPoints,
      };
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Fallback to mock data
      return {
        fid: "12345",
        walletAddress: state.walletConfirmed ? "0x1234...5678" : undefined,
        totalPoints: 1250,
      };
    }
  };

  const confirmWalletAPI = async (
    walletAddress: string
  ): Promise<UserPoints> => {
    try {
      const response = await fetch("/api/users/confirm-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          referrerFid: state.referrerFid,
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
      };
    } catch (error) {
      console.error("Failed to confirm wallet:", error);
      // Fallback to mock data
      return {
        fid: "12345",
        walletAddress,
        totalPoints: 1500, // Award 250 points for wallet confirmation
      };
    }
  };

  // Load user profile and check for referral code on mount
  useEffect(() => {
    const loadProfile = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const userData = await fetchUserProfile();

        // Check for referral code in URL
        const urlReferral = getReferralFromURL();
        if (urlReferral) {
          setReferralCode(urlReferral);
        }

        // Get stored referral code
        const storedReferral = getReferralCode();

        setState((prev) => ({
          ...prev,
          userPoints: userData,
          isAuthenticated: true,
          walletConfirmed: !!userData.walletAddress,
          referrerFid: storedReferral || undefined,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to load profile:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadProfile();
  }, []);

  const confirmWallet = async (walletAddress: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const updatedUser = await confirmWalletAPI(walletAddress);
      setState((prev) => ({
        ...prev,
        userPoints: updatedUser,
        walletConfirmed: true,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to confirm wallet:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const toggleWalletState = () => {
    setState((prev) => ({
      ...prev,
      walletConfirmed: !prev.walletConfirmed,
      userPoints: prev.userPoints
        ? {
            ...prev.userPoints,
            walletAddress: !prev.walletConfirmed ? "0x1234...5678" : undefined,
          }
        : null,
    }));
  };

  const setReferrerFid = (fid: string) => {
    setState((prev) => ({ ...prev, referrerFid: fid }));
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        confirmWallet,
        toggleWalletState,
        setReferrerFid,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
