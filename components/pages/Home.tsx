'use client';

import { Group, Image, Loader } from '@mantine/core';
import { useMiniApp } from '@/contexts/miniapp-context';
import { PageLayout } from '../ui/PageLayout';
import classes from '@/styles/animation.module.css';
import Prebuy from '../ui/Prebuy';

export default function Home() {
  const { isMiniAppReady } = useMiniApp();

  if (!isMiniAppReady)
    return (
      <PageLayout>
        <Image
          src="./images/beamrLogo.png"
          alt="Beamr Logo"
          width={80}
          height={80}
          fit="contain"
          className={classes.loadingEffect}
          mb={150}
        />
        <Group justify="center">
          <Loader color="var(--glass-thick)" />
        </Group>
      </PageLayout>
    );

  return (
    <PageLayout>
      <Prebuy />
    </PageLayout>
  );
}
