import React, { useState } from 'react';
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
import {
  CheckCheck,
  InfoIcon,
  RefreshCw,
  Infinity,
  Copy,
  Check,
} from 'lucide-react';
import PointsDisplay from './PointsDisplay';
import { usePoints } from '@/contexts/points-context';
import sdk from '@farcaster/miniapp-sdk';
import { BEAMR_ACCOUNT_FID } from '@/lib/constants';
import { useMiniApp } from '@/contexts/miniapp-context';
import { generateReferralURL } from '@/lib/storage';

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
  const [copied, setCopied] = useState(false);

  const handleFollowClick = async () => {
    await sdk.actions.viewProfile({
      fid: BEAMR_ACCOUNT_FID,
    });
  };

  const handleJoinClick = async () => {
    await sdk.actions.openUrl('https://farcaster.xyz/~/channel/beamr');
  };

  const handleCastClick = async () => {
    await sdk.actions.composeCast({
      text: 'Beamr is the easiest way to sustainably reward people who make your feed worth scrolling.  \n\nCheck out the @beamr dynamic micro-subscription app here:',
      embeds: [process.env.NEXT_PUBLIC_URL || ''],
    });
  };

  const handleAddMiniAppClick = async () => {
    if (!userPoints?.socialStatus?.appAdded) {
      await sdk.actions.addMiniApp();
    }
  };

  const handleCopyFallback = async () => {
    if (!userPoints?.fid) {
      return;
    }
    const referralURL = generateReferralURL(userPoints.fid);

    try {
      await navigator.clipboard.writeText(referralURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Copy failed:', error);
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeCopy = async () => {
    if (!userPoints?.fid) {
      return;
    }

    const referralURL = generateReferralURL(userPoints?.fid);

    if (navigator.share) {
      try {
        await navigator.share({
          url: referralURL,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fallback to copy
          handleCopyFallback();
        }
      }
    } else {
      // Fallback to copy
      handleCopyFallback();
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
            <Tooltip
              w={200}
              p={'xs'}
              multiline
              label={
                <Box p="sm">
                  <Text fz="sm" mb="sm">
                    {
                      "We're streaming 2M+ $SUP (Superfluid's governance token) to Beamrs over 90 days. The more XP you earn, the bigger your $SUP stream."
                    }
                  </Text>
                  <Text fz="sm">
                    Make sure you claim stream increases in the Superfluid Claim
                    App.
                  </Text>
                </Box>
              }
            >
              <InfoIcon
                color={colors.gray[0]}
                size={18}
                style={{ transform: 'translateY(-1px)' }}
              />
            </Tooltip>
          </Group>
          <Group gap="xs" justify="center">
            <PointsDisplay points={currentPoints} />
            <ActionIcon onClick={handleRefresh} disabled={isCoolingDown}>
              <RefreshCw size={22} />
            </ActionIcon>
          </Group>
          <Text ta="center" fz="sm" c={colors.gray[3]} mb="md">
            (Changes may take time to update)
          </Text>
          <Stack gap={14}>
            <ChecklistItem
              checked={hasAddedApp || false}
              text="Install app with notifications (100 XP)"
              action={handleAddMiniAppClick}
            />

            <ChecklistItem
              checked={hasFollowed || false}
              text="Follow @beamr (100 XP)"
              action={handleFollowClick}
            />

            <ChecklistItem
              checked={hasJoinedChannel || false}
              text="Join /beamr (100 XP)"
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
                Refer other quality users (250 XP/user)
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
            <Group justify="center">
              <Button size="lg" onClick={handleCastClick}>
                Share @beamr
              </Button>
            </Group>
            <Group justify="center">
              <Group
                gap={4}
                style={{ cursor: 'pointer' }}
                onClick={handleNativeCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <Text fz="sm">{copied ? 'Copied!' : 'Copy referral link'}</Text>
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

  action,
}: {
  checked: boolean;
  text: string;
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

      <Text
        c={checked ? colors.gray[4] : colors.blue[5]}
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
        {text}
      </Text>
    </Group>
  );
};
