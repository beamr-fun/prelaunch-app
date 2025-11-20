'use client';

import { useApiQuery } from '@/hooks/use-api-query';
import {
  Stack,
  Text,
  Avatar,
  Group,
  Paper,
  useMantineTheme,
  Box,
  Button,
  ScrollArea,
  ActionIcon,
  Container,
  Loader,
  Flex,
} from '@mantine/core';
import { RefreshCwIcon } from 'lucide-react';
import { PageLayout } from '../ui/PageLayout';
import { SfLogo } from '../ui/SFLogo';
import sdk from '@farcaster/miniapp-sdk';
import { useUser } from '@/contexts/user-context';
import { UserStanding } from '@/lib/constants';

export interface LeaderboardEntry {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  points: number;
  rank: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  error?: string;
}

export default function Leaderboard() {
  const { user } = useUser();
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useApiQuery<LeaderboardResponse>({
    url: '/api/leaderboard',
    queryKey: ['leaderboard'],
    staleTime: 15000,
    enabled: user && user.standing === UserStanding.Good,
  });
  let leaderboardData = response?.data || [];

  const isLoadingOrRefetching = isLoading || isRefetching;

  const noUsersFound = leaderboardData.length == 0;

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
            <Text fz="lg" fw={500}>
              Leaderboard
            </Text>
            <SfLogo />
          </Group>
        </Group>
        <TableHeader />
        <ScrollArea h={250}>
          <Stack gap={'md'}>
            {isLoadingOrRefetching ? (
              <Flex h={200} align={'center'} justify="center">
                <Loader color="var(--glass-thick)" />
              </Flex>
            ) : noUsersFound ? (
              <Flex h={200} align={'center'} justify="center">
                <Box>
                  <Text fz="lg" fw={500} ta="center">
                    No Users Found
                  </Text>
                  <Text ta="center">
                    {"There aren't any users with points"}
                  </Text>
                </Box>
              </Flex>
            ) : (
              leaderboardData.map((entry) => (
                <TableRow
                  key={entry.fid}
                  pfpUrl={entry.pfpUrl}
                  flowRate={'?'}
                  points={entry.points}
                  rank={entry.rank}
                  username={entry.username}
                />
              ))
            )}
          </Stack>
        </ScrollArea>
      </Paper>
      <Paper>
        <Text fz="lg" fw={500} mb="md">
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
  pfpUrl,
  flowRate,
  points,
  rank,
  username,
}: {
  pfpUrl: string;
  flowRate: string;
  points: number;
  rank: number;
  username: string;
}) => {
  return (
    <Group>
      <Group w={140} mr="auto" wrap="nowrap">
        <Text fz="sm">{rank}</Text>
        <Group gap={4} wrap="nowrap">
          <Avatar size={32} radius="xl" src={pfpUrl} />
          <Text fz="sm" fw={500} lineClamp={1}>
            {username}
          </Text>
        </Group>
      </Group>
      <Box w={44} ta="right">
        {points}
      </Box>
      <Text w={44} ta="right" mr={16}>
        {flowRate}
      </Text>
    </Group>
  );
};

export const TableHeader = () => {
  const { colors } = useMantineTheme();
  return (
    <Group c={colors.gray[0]} mb="16px">
      <Group w={140} mr="auto" ta="left">
        <Text fz="sm">#</Text>
        <Text fz="sm" fw={500}>
          User
        </Text>
      </Group>
      <Text w={44} fz="sm" fw={500} ta="right">
        Sup XP
      </Text>
      <Text w={44} fz="sm" fw={500} ta="right" mr={16}>
        SUP/mo
      </Text>
    </Group>
  );
};
