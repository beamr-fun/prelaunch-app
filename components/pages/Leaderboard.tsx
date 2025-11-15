'use client';

import { useApiQuery } from '@/hooks/use-api-query';
import {
  Flex,
  Container,
  Stack,
  Text,
  Table,
  Avatar,
  Group,
  Anchor,
  Loader,
  Paper,
  useMantineTheme,
  Box,
  Button,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import { ArrowLeft, RefreshCwIcon } from 'lucide-react';
import Link from 'next/link';
import RefreshButton from '@/components/ui/RefreshButton';
import { PageLayout } from '../ui/PageLayout';
import { SfLogo } from '../ui/SFLogo';

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
  const {
    data: response,
    isLoading,
    refetch,
    isRefetching,
  } = useApiQuery<LeaderboardResponse>({
    url: '/api/leaderboard',
    queryKey: ['leaderboard'],
    staleTime: 15000,
  });
  let leaderboardData = response?.data || [];

  const isLoadingOrRefetching = isLoading || isRefetching;

  const handleRefetch = () => {
    leaderboardData = [];
    refetch();
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
          <ActionIcon>
            <RefreshCwIcon size={20} />
          </ActionIcon>
        </Group>
        <TableHeader />
        <ScrollArea h={400}>
          <Stack gap={'md'}>
            {!isLoadingOrRefetching &&
              leaderboardData.length > 0 &&
              leaderboardData.map((entry) => (
                <TableRow
                  key={entry.fid}
                  pfpUrl={entry.pfpUrl}
                  flowRate={'?'}
                  points={entry.points}
                  rank={entry.rank}
                  username={entry.username}
                />
              ))}
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
            protocol Beamr uses)
          </Text>
          <Text>
            $SUP is the governance token of Superfluid (the streaming token
            protocol Beamr uses)
          </Text>
          <Text>Engage, share, grow, and use Beamr: you’ll get rewarded.</Text>
        </Stack>
        <Button size="lg">Claim SUP XP</Button>
      </Paper>
    </PageLayout>
  );

  //   return (
  //     <PageLayout>
  //       <Paper>
  //         {/* <Flex justify="space-between" align="center" mx="lg">
  //           <Anchor component={Link} href="/" c="white" fw={500}>
  //             <Flex align="center" gap="xs">
  //               <ArrowLeft size={12} />
  //               <Text size="xs">Back</Text>
  //             </Flex>
  //           </Anchor> */}
  //         {/* <RefreshButton
  //           onRefresh={() => handleRefetch()}
  //           disabled={isLoadingOrRefetching}

  //         /> */}
  //         {/* </Flex> */}
  //         <Container
  //           py="sm"
  //           style={{
  //             marginInline: 'unset',
  //           }}
  //         >
  //           <Stack align="center" gap="xl">
  //             <Stack gap="md" style={{ width: '100%', maxWidth: '800px' }}>
  //               <Table
  //                 withRowBorders={false}
  //                 style={{
  //                   overflow: 'hidden',
  //                 }}
  //               >
  //                 <Table.Thead>
  //                   <Table.Tr>
  //                     <Table.Th c="white" colSpan={3}>
  //                       <Text fz="sm" fw="500">
  //                         Users
  //                       </Text>
  //                     </Table.Th>
  //                     <Table.Th c="white" ta="right">
  //                       <Text fz="xs" fw="500">
  //                         Pre-BEAMR
  //                       </Text>
  //                     </Table.Th>
  //                     <Table.Th c="white" ta="right">
  //                       <Text fz="xs" fw="500">
  //                         BEAMR/mo
  //                       </Text>
  //                     </Table.Th>
  //                   </Table.Tr>
  //                 </Table.Thead>
  //                 <Table.Tbody>
  //                   {isLoadingOrRefetching && (
  //                     <Stack align="center" gap="sm" py="xl">
  //                       <Loader color="white" />
  //                     </Stack>
  //                   )}

  //                   {!isLoadingOrRefetching && leaderboardData.length === 0 && (
  //                     <Stack align="center" gap="sm" py="xl">
  //                       <Text c="dimmed">No leaderboard data available</Text>
  //                     </Stack>
  //                   )}

  // {!isLoadingOrRefetching &&
  //   leaderboardData.length > 0 &&
  //   leaderboardData.map((entry) => (
  //     <Table.Tr key={entry.fid}>
  //       <Table.Td c="gray.3" fw={600}>
  //         {entry.rank}
  //       </Table.Td>
  //       <Table.Td>
  //         <Group gap="sm">
  //           <Avatar
  //             src={entry.pfpUrl}
  //             alt={`${entry.displayName}'s profile picture`}
  //             size="sm"
  //             radius="xl"
  //           />

  //           <Text size="xs" c="gray.4">
  //             @{entry.username}
  //           </Text>
  //         </Group>
  //       </Table.Td>
  //       <Table.Td ta="right" c="white" fw={600}>
  //         {entry.points.toLocaleString()}
  //       </Table.Td>
  //       <Table.Td ta="right" c="gray.4">
  //         ?
  //       </Table.Td>
  //     </Table.Tr>
  //   ))}
  //                 </Table.Tbody>
  //               </Table>
  //             </Stack>
  //           </Stack>
  //         </Container>
  //       </Paper>
  //     </PageLayout>
  //   );
  // }
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
