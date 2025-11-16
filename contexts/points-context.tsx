'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useUser } from './user-context';
import { useMiniApp } from './miniapp-context';
import {
  getReferralFromURL,
  setReferralCode,
  getReferralCode,
} from '@/lib/storage';

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
}

export interface PointsState {
  userPoints: UserPoints | null;
  isLoading: boolean;
  error: string | null;
}

interface PointsContextType extends PointsState {
  confirmWallet: (walletAddress: string) => Promise<void>;
  setReferrerFid: (fid: string) => void;
  refetchPoints: () => Promise<void>;
  referrerFid?: string;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

interface PointsProviderProps {
  children: ReactNode;
}

export function PointsProvider({ children }: PointsProviderProps) {
  const { user } = useUser();
  const { context: miniAppContext } = useMiniApp();
  const [state, setState] = useState<PointsState>({
    userPoints: null,
    isLoading: true,
    error: null,
  });
  const [referrerFid, setReferrerFidState] = useState<string | undefined>(
    undefined
  );

  const fetchUserProfile = async (): Promise<UserPoints | undefined> => {
    try {
      // Only fetch if we're in a mini app context
      if (!miniAppContext) {
        throw new Error('Not in mini app context');
      }

      // 10.19 removing this on profile fetch due to context no updating.
      //  webhook and confirm wallet route will bethe only places we update app add points
      // console.log(
      //   "fetchUserProfile miniAppAdded miniAppContext?.client",
      //   miniAppContext?.client
      // );
      // const miniAppAdded = miniAppContext?.client?.added;
      // // Pass miniapp status as query parameter
      // const url = `/api/users/profile${
      //   miniAppAdded ? "?miniAppAdded=true" : ""
      // }`;

      const url = `api/users/profile`;

      const response = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
      });

      console.log('response', response);

      const error = await response.json();

      console.log('error', error);
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
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  const confirmWalletAPI = async (
    walletAddress: string
  ): Promise<UserPoints> => {
    try {
      // Only proceed if we're in a mini app context
      if (!miniAppContext) {
        throw new Error('Not in mini app context');
      }

      const miniAppAdded = miniAppContext?.client?.added;
      const newContext = sdk.context;
      console.log('newContext', newContext);
      const response = await fetch('/api/users/confirm-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          walletAddress,
          referrerFid: referrerFid,
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
      };
    } catch (error) {
      console.error('Failed to confirm wallet:', error);
      throw error;
    }
  };

  // Handle referral code from URL and storage
  useEffect(() => {
    // Check for referral code in URL
    const urlReferral = getReferralFromURL();
    if (urlReferral) {
      console.log('setting ref');
      setReferralCode(urlReferral);
      setReferrerFidState(urlReferral);
      return;
    }

    // Get stored referral code
    const storedReferral = getReferralCode();
    if (storedReferral) {
      setReferrerFidState(storedReferral);
    }
  }, []);

  // Load points when user is authenticated and in mini app
  useEffect(() => {
    const loadPoints = async () => {
      if (!user.data || !miniAppContext) {
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

        setState((prev) => ({
          ...prev,
          userPoints: userData || null,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Failed to load points:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to load points',
        }));
      }
    };

    loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.data, user.isLoading, miniAppContext]);

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
      console.error('Failed to confirm wallet:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to confirm wallet',
      }));
    }
  };

  const setReferrerFid = (fid: string) => {
    setReferrerFidState(fid);
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
      console.error('Failed to refetch points:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to refetch points',
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
        referrerFid,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
