"use client";

import { useUser } from "@/contexts/user-context";
import { useWallet } from "@/contexts/wallet-context";
import {
  Flex,
  Container,
  Stack,
  Text,
  Title,
  Button,
  Paper,
  Switch,
  Group,
} from "@mantine/core";
import Image from "next/image";
import { useAccount } from "wagmi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/countdown/CountdownTimer";
import PreBeamsCounter from "@/components/points/PreBeamsCounter";
import PointsDisplay from "@/components/points/PointsDisplay";
import WalletSelector from "@/components/wallet/WalletSelector";
import WalletConfirmButton from "@/components/wallet/WalletConfirmButton";
import ReferralCode from "@/components/referral/ReferralCode";
import ShareButton from "@/components/referral/ShareButton";
import { Rainbow } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { address } = useAccount();
  const {
    userPoints,
    walletConfirmed,
    isLoading: walletLoading,
    confirmWallet,
    toggleWalletState,
    referrerFid,
  } = useWallet();

  // Mock data for testing
  const mockUser = {
    data: {
      fid: "12345",
      display_name: "Test User",
      username: "testuser",
      pfp_url: "https://via.placeholder.com/80x80/667eea/ffffff?text=T",
    },
  };

  // Mock wallet addresses for testing
  const mockWallets = [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "0x9876543210987654321098765432109876543210",
  ];

  const [selectedWallet, setSelectedWallet] = useState<string>("");

  // Mock launch date (30 days from now)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  const handleFollowClick = () => {
    // TODO: Link to Farcaster profile
    console.log("Follow @beamer clicked");
  };

  const handleJoinClick = () => {
    // TODO: Link to /beamer channel
    console.log("Join /beamer clicked");
  };

  const handleCastClick = () => {
    // TODO: Open Farcaster compose interface
    console.log("Create Cast clicked");
  };

  // Use mock user for testing, fallback to real user
  const currentUser = mockUser || user;

  const currentPoints = userPoints?.totalPoints || 1250;

  return (
    <Flex
      direction="column"
      style={{ minHeight: "100vh" }}
      bg="dark.8"
      c="white"
    >
      <Header />

      <Container style={{ flex: 1 }} px="md" py="xl">
        <Stack align="center" gap="xl" style={{ height: "100%" }}>
          <Rainbow size={140} />

          {/* Countdown Timer */}
          <CountdownTimer targetDate={launchDate} />

          {/* User Profile Section */}
          {currentUser?.data ? (
            <Flex direction="column" align="center" gap="md">
              {walletConfirmed && <PreBeamsCounter points={currentPoints} />}
              {!walletConfirmed && (
                <Text ta="center" size="sm">
                  Confirm your preferred wallet to earn your first Beamer token
                  stream at launch.
                </Text>
              )}
            </Flex>
          ) : (
            <Button
              onClick={signIn}
              disabled={isLoading}
              color="white"
              variant="outline"
              size="xl"
            >
              {isLoading ? (
                <>
                  <div />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          )}

          {/* Wallet Section */}
          {currentUser?.data && (
            <Stack align="center" gap="md">
              {!walletConfirmed && (
                <>
                  <WalletSelector
                    wallets={mockWallets}
                    selectedWallet={selectedWallet}
                    onWalletSelect={setSelectedWallet}
                    disabled={walletLoading}
                  />

                  <WalletConfirmButton
                    onConfirm={confirmWallet}
                    selectedWallet={selectedWallet}
                    disabled={!selectedWallet}
                    isLoading={walletLoading}
                  />
                </>
              )}
            </Stack>
          )}

          {/* Referral Section - Only show when wallet is confirmed */}
          {currentUser?.data && walletConfirmed && (
            <Flex
              direction="column"
              align="center"
              gap="lg"
              style={{ width: "100%", maxWidth: "400px" }}
            >
              <Flex direction="row" gap="md" wrap="wrap" justify="center">
                <ShareButton
                  referralCode={currentUser.data.fid}
                  onShare={(platform) => console.log(`Shared via ${platform}`)}
                />
              </Flex>
            </Flex>
          )}
        </Stack>
      </Container>

      <Footer
        onFollowClick={handleFollowClick}
        onJoinClick={handleJoinClick}
        onCastClick={handleCastClick}
      />
    </Flex>
  );
}
