import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import LaunchPhase from './LaunchPhase';
import { CheckCheck, InfoIcon, RefreshCw, Infinity, Copy } from 'lucide-react';
import PointsDisplay from './PointsDisplay';
import { usePoints } from '@/contexts/points-context';

const Checklist = () => {
  const { colors } = useMantineTheme();
  const { userPoints } = usePoints();
  const currentPoints = userPoints?.totalPoints || 0;
  return (
    <Box>
      <Image
        src="./images/beamrLogo.png"
        alt="Beamr Logo"
        width={80}
        height={80}
        mb="md"
        fit="contain"
      />
      <Box>
        <LaunchPhase />
        <Paper>
          <Group gap="xs" justify="center">
            <Text fz="sm" c={colors.gray[3]}>
              Your SUP XP
            </Text>
            <Tooltip label="LKJLK  KJ LKJ L KJ KJ LKJ LKJ LK J">
              <InfoIcon
                color={colors.gray[0]}
                size={18}
                style={{ transform: 'translateY(-1px)' }}
              />
            </Tooltip>
          </Group>
          <Group gap="xs" justify="center" mb="sm">
            <PointsDisplay points={currentPoints} />
            <ActionIcon>
              <RefreshCw size={22} />
            </ActionIcon>
          </Group>

          <Stack gap={14}>
            <Group wrap="nowrap" align="start">
              <CheckCheck
                size={24}
                strokeWidth={2}
                style={{
                  stroke: 'url(#beamr-gradient)',
                  fill: 'none',
                }}
              />
              <Box>
                <Text c={colors.gray[1]} mb={2}>
                  Install app with notifications (100 XP)
                </Text>
                <Text c={colors.blue[5]} fz="sm" td="underline">
                  Click here to install the app
                </Text>
              </Box>
            </Group>
            <Group wrap="nowrap" align="start">
              <CheckCheck
                size={24}
                strokeWidth={2}
                style={{
                  stroke: 'url(#beamr-gradient)',
                  fill: 'none',
                }}
              />
              <Box>
                <Text c={colors.gray[1]} mb={2}>
                  Follow @beamr (100 XP)
                </Text>
                <Text c={colors.blue[5]} fz="sm" td="underline">
                  Click here to follow @beamr
                </Text>
              </Box>
            </Group>
            <Group wrap="nowrap" align="start">
              <CheckCheck
                size={24}
                strokeWidth={2}
                style={{
                  stroke: 'url(#beamr-gradient)',
                  fill: 'none',
                }}
              />
              <Box>
                <Text c={colors.gray[1]} mb={2}>
                  Join /beamr (100 XP)
                </Text>
                <Text c={colors.blue[5]} fz="sm" td="underline">
                  Click here to join /beamr
                </Text>
              </Box>
            </Group>
            <Group wrap="nowrap" align="start">
              <Infinity
                size={24}
                strokeWidth={2}
                style={{
                  stroke: 'url(#beamr-gradient)',
                  fill: 'none',
                }}
              />

              <Text c={colors.gray[1]} mb={2}>
                Refer other quality users (150 XP/user)
              </Text>
            </Group>
            <Group wrap="nowrap" align="start">
              <Infinity
                size={24}
                strokeWidth={2}
                style={{
                  stroke: 'url(#beamr-gradient)',
                  fill: 'none',
                }}
              />
              <Text c={colors.gray[1]} mb={2} style={{ flex: 1 }}>
                Engage, share, grow, and use Beamr (+++ XP, bots & slop need not
                apply)
              </Text>
            </Group>
            <Text fz="sm" c={colors.gray[3]} mb="md">
              Changes may take time to update in the UI.
            </Text>
            <Button size="lg">Share @beamr</Button>
            <Group justify="center">
              <Group gap={4} style={{ cursor: 'pointer' }}>
                <Copy size={14} />
                <Text fz="sm">Copy referral code</Text>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Checklist;
