"use client";

import { useUser } from "@/contexts/user-context";
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
import { usePoints } from "@/contexts/points-context";

export default function Home() {
  const { user, isLoading, error, signIn } = useUser();
  const { address } = useAccount();
  const {
    userPoints,
    isLoading: walletLoading,
    confirmWallet,
    referrerFid,
    setReferrerFid,
  } = usePoints();

  const [selectedWallet, setSelectedWallet] = useState<string>("");

  const launchDate = getLaunchDate();

  console.log("user", user);

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
            {userPoints?.walletConfirmed && (
              <PreBeamsCounter points={currentPoints} />
            )}
            {!userPoints?.walletConfirmed && !walletLoading && (
              <Text ta="center" size="lg">
                Confirm your preferred wallet to earn your first Beamer token
                stream at launch.
              </Text>
            )}
          </Flex>
        )}
        {!currentUser?.data && !isLoading && !walletLoading && (
          <Button onClick={signIn} disabled={isLoading} size="xl">
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
            {!userPoints?.walletConfirmed && !walletLoading && (
              <>
                <WalletSelector
                  wallets={currentUser.data.verified_addresses.eth_addresses}
                  primaryWallet={
                    currentUser.data.verified_addresses.primary.eth_address
                  }
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
        {currentUser?.data && userPoints?.walletConfirmed && (
          <Flex
            direction="column"
            align="center"
            gap="lg"
            style={{ width: "100%", maxWidth: "400px" }}
          >
            <Anchor component={Link} href="/leaderboard">
              <Flex direction="row" align="center" gap="xs">
                <ChartNoAxesColumn size={16} />
                <Text size="sm"> Leaderboard</Text>
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
