'use client';

import {
  Stack,
  Text,
  Group,
  Paper,
  Button,
  ScrollArea,
  useMantineTheme,
} from '@mantine/core';
import { PageLayout } from '../ui/PageLayout';
import { SfLogo } from '../ui/SFLogo';
import sdk from '@farcaster/miniapp-sdk';

export interface LeaderboardEntry {
  username: string;
  points: number;
  rank: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: 'skydao.eth', points: 2502100 },
  { rank: 2, username: 'toadyhawk.eth', points: 2500000 },
  { rank: 3, username: '0x3A305C…79468c', points: 2000000 },
  { rank: 4, username: 'leovido.eth', points: 1600350 },
  { rank: 5, username: 'costi', points: 1573500 },
  { rank: 6, username: 'ccalo.eth', points: 1500350 },
  { rank: 7, username: 'vorcha', points: 1240000 },
  { rank: 8, username: 'wlrui', points: 1200000 },
  { rank: 9, username: 'czbanger', points: 1020500 },
  { rank: 10, username: 'jacketet', points: 960000 },
  { rank: 11, username: '0xf4F191…F83c83', points: 800000 },
  { rank: 12, username: 'doldole', points: 522350 },
  { rank: 13, username: 'skuhl.eth', points: 500600 },
  { rank: 14, username: 'feez', points: 500000 },
  { rank: 15, username: 'bsiegz.eth', points: 500000 },
  { rank: 16, username: 'defipolice.eth', points: 500000 },
  { rank: 17, username: 'ds8', points: 350000 },
  { rank: 18, username: 'mvr', points: 345350 },
  { rank: 19, username: '0xfran', points: 330350 },
  { rank: 20, username: 'logonaut.eth', points: 325050 },
];

export default function Leaderboard() {
  const { colors } = useMantineTheme();

  const handleSupLink = async () => {
    await sdk.actions.openUrl(
      'https://farcaster.xyz/miniapps/1NTJKdUZCsPI/superfluid-claim-app'
    );
  };

  return (
    <PageLayout>
      <Paper mb="lg">
        <Group mb="lg" justify="space-between">
          <Group>
            <Text
              fz="lg"
              fw={500}
              variant="gradient"
              gradient={{
                from: colors.blue[0],
                to: colors.blue[4],
                deg: 90,
              }}
            >
              Leaderboard
            </Text>
            <SfLogo />
          </Group>
        </Group>
        <TableHeader />
        <ScrollArea h={250} scrollbars="y">
          <Stack gap={'md'}>
            {leaderboardData.map((entry) => (
              <TableRow
                key={entry.rank}
                points={entry.points}
                rank={entry.rank}
                username={entry.username}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Paper>
      <Paper>
        <Text
          fz="lg"
          fw={500}
          mb="md"
          variant="gradient"
          gradient={{
            from: colors.blue[0],
            to: colors.blue[4],
            deg: 90,
          }}
        >
          {"What's SUP?"}
        </Text>
        <Stack gap={12} mb="xl">
          <Text>
            $SUP is the governance token of Superfluid (the streaming token
            protocol Beamr uses).
          </Text>
          <Text>We have 2M+ $SUP to stream as rewards over 90 days.</Text>
          <Text>Engage, share, grow, and use Beamr: you’ll get rewarded.</Text>
        </Stack>
        <Group justify="center">
          <Button size="lg" onClick={handleSupLink}>
            Claim SUP XP
          </Button>
        </Group>
      </Paper>
    </PageLayout>
  );
}

export const TableRow = ({
  points,
  rank,
  username,
}: {
  points: number;
  rank: number;
  username: string;
}) => {
  return (
    <Group wrap="nowrap">
      <Text fz="sm" w={24}>{rank}</Text>
      <Text fz="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
        {username}
      </Text>
      <Text fz="sm" ta="right">
        {points.toLocaleString()}
      </Text>
    </Group>
  );
};

export const TableHeader = () => {
  const { colors } = useMantineTheme();
  return (
    <Group c={colors.gray[0]} mb="16px" wrap="nowrap">
      <Text fz="sm" w={24}>#</Text>
      <Text fz="sm" fw={500} style={{ flex: 1 }}>
        User
      </Text>
      <Text fz="sm" fw={500} ta="right">
        SUP XP
      </Text>
    </Group>
  );
};
