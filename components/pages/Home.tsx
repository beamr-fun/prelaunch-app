"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Flex,
  Container,
  Stack,
  Text,
  Button,
  Anchor,
  Loader,
} from "@mantine/core";
import { ChartNoAxesColumn, RotateCcw } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { usePoints } from "@/contexts/points-context";
import CountdownTimer from "@/components/ui/CountdownTimer";
import PreBeamsCounter from "@/components/ui/PreBeamsCounter";
import WalletSelector from "@/components/wallet/WalletSelector";
import WalletConfirmButton from "@/components/wallet/WalletConfirmButton";
import ShareButton from "@/components/ui/ShareButton";
import RefreshButton from "@/components/ui/RefreshButton";
import { getLaunchDate } from "@/lib/constants";
import { useMiniApp } from "@/contexts/miniapp-context";

export default function Home() {
  const { isMiniAppReady } = useMiniApp();
  const { user, isLoading, signIn } = useUser();
  const {
    userPoints,
    isLoading: walletLoading,
    confirmWallet,
    refetchPoints,
  } = usePoints();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [isCooldown, setIsCooldown] = useState(false);
  const launchDate = getLaunchDate();
  const currentUser = user;
  const currentPoints = userPoints?.totalPoints || 0;
  const loadingUserOrMiniApp = isLoading || walletLoading || !isMiniAppReady;

  console.log("isMiniAppReady", isMiniAppReady);
  console.log("isLoading", isLoading);
  console.log("walletLoading", walletLoading);

  const handleRefresh = useCallback(() => {
    if (isCooldown) return;
    if (!currentUser?.data || !userPoints) return;

    console.log("refetching");
    refetchPoints();
    setIsCooldown(true);

    const interval = setInterval(() => {
      clearInterval(interval);
      setIsCooldown(false);
    }, 10000);
  }, [currentUser?.data, isCooldown, refetchPoints, userPoints]);

  if (loadingUserOrMiniApp) {
    return (
      <Container style={{ flex: 1 }} px="md" py="xl">
        <Stack align="center" gap="xl" style={{ height: "100%" }}>
          <CountdownTimer targetDate={launchDate} />
          <Loader color="white" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container px="md" py="xl">
      <Stack align="center" gap="xl" style={{ height: "100%" }}>
        <CountdownTimer targetDate={launchDate} />

        {!currentUser?.data && (
          <Button onClick={signIn} disabled={isLoading} size="xl">
            {isLoading ? <span>Signing in...</span> : "Sign in"}
          </Button>
        )}

        {currentUser?.data && !userPoints?.walletConfirmed && (
          <Stack align="center" gap="md">
            <Text ta="center" size="lg">
              Confirm your preferred wallet to earn your first Beamer token
              stream at launch.
            </Text>
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
          </Stack>
        )}

        {currentUser?.data && userPoints?.walletConfirmed && (
          <Flex direction="column" align="center" gap="md">
            <Flex align="center" gap="md">
              <PreBeamsCounter points={currentPoints} />
            </Flex>

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
          </Flex>
        )}
        <Button
          variant="transparent"
          disabled={isCooldown || !currentUser?.data || !userPoints}
          onClick={handleRefresh}
        >
          <RotateCcw size={12} />
        </Button>
      </Stack>
    </Container>
  );
}
