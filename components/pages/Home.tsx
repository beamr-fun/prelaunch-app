'use client';

import { useCallback, useEffect, useState } from 'react';
import { Group, Image, Loader } from '@mantine/core';
import { useUser } from '@/contexts/user-context';
import { usePoints } from '@/contexts/points-context';
import { useMiniApp } from '@/contexts/miniapp-context';
import { PageLayout } from '../ui/PageLayout';
import classes from '@/styles/animation.module.css';
import Checklist from '../ui/Checklist';
import { WalletSelect } from '../ui/WalletSelect';
import Greeting from '../ui/Greeting';

export default function Home() {
  const { isMiniAppReady } = useMiniApp();
  const { user, isLoading, error: userContextError } = useUser();
  const {
    userPoints,
    isLoading: walletLoading,
    confirmWallet,
    refetchPoints,
    error: pointsError,
  } = usePoints();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isCooldown, setIsCooldown] = useState(false);
  const currentUser = user;

  const loadingUserOrMiniApp =
    isLoading ||
    (walletLoading && !userPoints) ||
    !isMiniAppReady ||
    currentUser?.isLoading;

  const handleRefresh = useCallback(() => {
    if (isCooldown) return;
    if (!currentUser?.data || !userPoints) return;

    refetchPoints();
    setIsCooldown(true);

    const interval = setInterval(() => {
      clearInterval(interval);
      setIsCooldown(false);
    }, 10000);
  }, [currentUser?.data, isCooldown, refetchPoints, userPoints]);

  const confirmGreeted = () => {
    localStorage.setItem('hasGreeted', 'true');
    setHasGreeted(true);
  };

  useEffect(() => {
    const greeted = localStorage.getItem('hasGreeted');
    if (greeted === 'true') {
      setHasGreeted(true);
    }
  }, []);

  if (loadingUserOrMiniApp || !currentUser?.data)
    return (
      <PageLayout>
        <Image
          src="./images/beamrLogo.png"
          alt="Beamr Logo"
          width={80}
          height={80}
          // mb="md"
          fit="contain"
          className={classes.loadingEffect}
          mb={150}
        />
        <Group justify="center">
          <Loader color="var(--glass-thick)" />
        </Group>
      </PageLayout>
    );

  // if (userContextError || user.error) {
  //   return (
  //     <PageLayout>
  //       <Image
  //         src="./images/beamrLogo.png"
  //         alt="Beamr Logo"
  //         width={80}
  //         height={80}
  //         mb="md"
  //         fit="contain"
  //       />
  //       <ErrorDisplay
  //         title={'Error loading User Data'}
  //         errorMsg={userContextError?.message || user.error?.message}
  //       />
  //     </PageLayout>
  //   );
  // }

  // if (pointsError) {
  //   return (
  //     <PageLayout>
  //       <Image
  //         src="./images/beamrLogo.png"
  //         alt="Beamr Logo"
  //         width={80}
  //         height={80}
  //         mb="md"
  //         fit="contain"
  //       />
  //       <ErrorDisplay
  //         title={'Error loading Points Data'}
  //         errorMsg={pointsError}
  //       />
  //     </PageLayout>
  //   );
  // }

  if (!hasGreeted) {
    return (
      <PageLayout>
        <Greeting confirmGreeted={confirmGreeted} />
      </PageLayout>
    );
  }

  if (!userPoints?.walletConfirmed) {
    return (
      <PageLayout>
        <WalletSelect
          onWalletSelect={(addr: string) => {
            setSelectedWallet(addr);
          }}
          selectedWallet={selectedWallet}
          confirmWallet={confirmWallet}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Checklist handleRefresh={handleRefresh} isCoolingDown={isCooldown} />
    </PageLayout>
  );
}
