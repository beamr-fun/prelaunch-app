"use client";

import { useUser } from "@/contexts/user-context";
import { usePoints } from "@/contexts/points-context";
import { Flex, Container, Stack, Text, Button, Anchor } from "@mantine/core";
import { useAccount } from "wagmi";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import PreBeamsCounter from "@/components/ui/PreBeamsCounter";
import WalletSelector from "@/components/wallet/WalletSelector";
import WalletConfirmButton from "@/components/wallet/WalletConfirmButton";
import ShareButton from "@/components/ui/ShareButton";
import { ChartNoAxesColumn, Rainbow } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { getLaunchDate } from "@/lib/constants";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { address } = useAccount();
  const {
    userPoints,
    walletConfirmed,
    isLoading: walletLoading,
    confirmWallet,
    referrerFid,
  } = usePoints();

  console.log("user", user);

  const [selectedWallet, setSelectedWallet] = useState<string>("");

  const launchDate = getLaunchDate();

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
  const currentUser = user;

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
          <Rainbow size={75} />

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
                    // wallets={mockWallets}
                    wallets={currentUser.data.verified_addresses.eth_addresses}
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
              <Anchor
                component={Link}
                href="/leaderboard"
                c="white"
                fw={500}
                mx="lg"
              >
                <Flex direction="row" align="center" gap="xs">
                  <ChartNoAxesColumn size={16} />
                  <Text size="xs"> Leaderboard</Text>
                </Flex>
              </Anchor>
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
