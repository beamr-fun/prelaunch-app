'use client';

const DEFAULT_NAV_LINKS = [
  {
    link: '/',
    Icon: Home,
  },
  {
    link: '/leaderboard',
    Icon: SfLogo,
  },
  {
    link: '/info',
    Icon: Info,
  },
];

import { usePathname, useRouter } from 'next/navigation';
import { Box, Group, ActionIcon } from '@mantine/core';
import { Home, Info } from 'lucide-react';
import classes from '@/styles/layout.module.css';
import { SfLogo } from './SFLogo';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box className={classes.navBox}>
      <Group className={classes.innerNavBox}>
        {DEFAULT_NAV_LINKS.map(({ link, Icon }) => {
          const isSelected = pathname === link;

          return (
            <ActionIcon
              key={link}
              className={isSelected ? classes.navLinkSelected : classes.navLink}
              onClick={() => router.push(link)}
            >
              <Icon size={28} />
            </ActionIcon>
          );
        })}
      </Group>
    </Box>
  );
}
