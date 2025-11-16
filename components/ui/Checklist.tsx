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
import sdk from '@farcaster/miniapp-sdk';
import { BEAMR_ACCOUNT_FID } from '@/lib/constants';
import { useMiniApp } from '@/contexts/miniapp-context';

const Checklist = ({
  handleRefresh,
  isCoolingDown,
}: {
  handleRefresh: () => void;
  isCoolingDown: boolean;
}) => {
  const { colors } = useMantineTheme();
  const { context } = useMiniApp();

  const { userPoints } = usePoints();
  const currentPoints = userPoints?.totalPoints || 0;

  const handleFollowClick = async () => {
    await sdk.actions.viewProfile({
      fid: BEAMR_ACCOUNT_FID,
    });
  };

  const handleJoinClick = async () => {
    console.log('Joining channel...');
    await sdk.actions.openUrl('https://farcaster.xyz/~/channel/beamr');
  };

  const handleCastClick = async () => {
    await sdk.actions.composeCast({
      text: 'beamr',
      embeds: [process.env.NEXT_PUBLIC_URL || ''],
    });
  };

  const handleAddMiniAppClick = async () => {
    if (!userPoints?.socialStatus?.appAdded) {
      await sdk.actions.addMiniApp();
    }
  };

  const hasAddedApp =
    context?.client.added || userPoints?.socialStatus?.appAdded;
  const hasFollowed = userPoints?.socialStatus.following;
  const hasJoinedChannel = userPoints?.socialStatus?.inChannel;

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
            <ActionIcon onClick={handleRefresh} disabled={isCoolingDown}>
              <RefreshCw size={22} />
            </ActionIcon>
          </Group>

          <Stack gap={14}>
            <ChecklistItem
              checked={hasAddedApp || false}
              text="Install app with notifications (100 XP)"
              actionText="Click here to install the app"
              action={handleAddMiniAppClick}
            />

            <ChecklistItem
              checked={hasFollowed || false}
              text="Follow @beamr (100 XP)"
              actionText="Click here to follow @beamr"
              action={handleFollowClick}
            />

            <ChecklistItem
              checked={hasJoinedChannel || false}
              text="Join /beamr (100 XP)"
              actionText="Click here to join /beamr"
              action={handleJoinClick}
            />
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
            <Button size="lg" onClick={handleCastClick}>
              Share @beamr
            </Button>
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

const ChecklistItem = ({
  checked,
  text,
  actionText,
  action,
}: {
  checked: boolean;
  text: string;
  actionText: string;
  action: () => void;
}) => {
  const { colors } = useMantineTheme();
  return (
    <Group wrap="nowrap" align="start">
      <CheckCheck
        size={24}
        strokeWidth={2}
        style={{
          stroke: checked ? 'url(#beamr-gradient)' : colors.gray[6],
          fill: 'none',
        }}
      />
      <Box>
        <Text c={colors.gray[1]} mb={2}>
          {text}
        </Text>
        <Text
          c={checked ? colors.gray[4] : colors.blue[5]}
          fz="sm"
          td={checked ? 'line-through' : 'underline'}
          style={{
            cursor: checked ? 'text' : 'pointer',
          }}
          onClick={() => {
            if (!checked) {
              action();
            }
          }}
        >
          {actionText}
        </Text>
      </Box>
    </Group>
  );
};
