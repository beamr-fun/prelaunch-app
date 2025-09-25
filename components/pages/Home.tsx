"use client";

import { useUser } from "@/contexts/user-context";
import { usePoints } from "@/contexts/points-context";
import { Flex, Container, Stack, Text, Button, Anchor } from "@mantine/core";
import { useAccount } from "wagmi";
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
  console.log("userPoints", userPoints);
  console.log("walletConfirmed", walletConfirmed);

  console.log("walletLoading", walletLoading);

  const [selectedWallet, setSelectedWallet] = useState<string>("");

  const launchDate = getLaunchDate();

  const currentUser = user;

  const currentPoints = userPoints?.totalPoints || 0;

  return (
    <Container style={{ flex: 1 }} px="md" py="xl">
      <Stack align="center" gap="xl" style={{ height: "100%" }}>
        {/* <Rainbow size={75} /> */}

        {/* Countdown Timer */}
        <CountdownTimer targetDate={launchDate} />

        {/* User Profile Section */}
        {currentUser?.data && (
          <Flex direction="column" align="center" gap="md">
            {walletConfirmed && <PreBeamsCounter points={currentPoints} />}
            {!walletConfirmed && !walletLoading && (
              <Text ta="center" size="sm">
                Confirm your preferred wallet to earn your first Beamer token
                stream at launch.
              </Text>
            )}
          </Flex>
        )}
        {!currentUser?.data && !isLoading && !walletLoading && (
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
            {!walletConfirmed && !walletLoading && (
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
              <ShareButton referralCode={currentUser.data.fid} />
            </Flex>
          </Flex>
        )}
      </Stack>
    </Container>
  );
}
