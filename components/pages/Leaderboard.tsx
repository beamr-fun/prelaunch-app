"use client";

import { useApiQuery } from "@/hooks/use-api-query";
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
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RefreshButton from "@/components/ui/RefreshButton";

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
    url: "/api/leaderboard",
    queryKey: ["leaderboard"],
    staleTime: 15000,
  });
  let leaderboardData = response?.data || [];

  const isLoadingOrRefetching = isLoading || isRefetching;

  const handleRefetch = () => {
    leaderboardData = [];
    refetch();
  };

  return (
    <>
      <Flex justify="space-between" align="center" mx="lg">
        <Anchor component={Link} href="/" c="white" fw={500}>
          <Flex align="center" gap="xs">
            <ArrowLeft size={12} />
            <Text size="xs">Back</Text>
          </Flex>
        </Anchor>
        <RefreshButton
          onRefresh={() => handleRefetch()}
          disabled={isLoadingOrRefetching}
        />
      </Flex>
      <Container
        py="sm"
        style={{
          marginInline: "unset",
        }}
      >
        <Stack align="center" gap="xl">
          <Stack gap="md" style={{ width: "100%", maxWidth: "800px" }}>
            <Table
              withRowBorders={false}
              style={{
                overflow: "hidden",
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th c="white" colSpan={2}>
                    <Text size="xl" fw="700">
                      Leaderboard
                    </Text>
                  </Table.Th>
                  <Table.Th c="white" ta="right">
                    <Text size="xs" fw="700">
                      Pre-BEAMR
                    </Text>
                  </Table.Th>
                  <Table.Th c="white" ta="right">
                    <Text size="xs" fw="700">
                      BEAMR/mo
                    </Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoadingOrRefetching && (
                  <Stack align="center" gap="sm" py="xl">
                    <Loader color="white" />
                  </Stack>
                )}

                {!isLoadingOrRefetching && leaderboardData.length === 0 && (
                  <Stack align="center" gap="sm" py="xl">
                    <Text c="dimmed">No leaderboard data available</Text>
                  </Stack>
                )}

                {!isLoadingOrRefetching &&
                  leaderboardData.length > 0 &&
                  leaderboardData.map((entry) => (
                    <Table.Tr key={entry.fid}>
                      <Table.Td c="gray.3" fw={600}>
                        {entry.rank}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar
                            src={entry.pfpUrl}
                            alt={`${entry.displayName}'s profile picture`}
                            size="sm"
                            radius="xl"
                          />

                          <Text size="xs" c="gray.4">
                            @{entry.username}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td ta="right" c="white" fw={600}>
                        {entry.points.toLocaleString()}
                      </Table.Td>
                      <Table.Td ta="right" c="gray.4">
                        ?
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
