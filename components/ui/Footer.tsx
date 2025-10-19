"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Flex, Button, Text } from "@mantine/core";
import {
  MessageCircle,
  MessageSquareText,
  UserPlus,
  Plus,
  CircleCheck,
} from "lucide-react";

import { BEAMR_ACCOUNT_FID } from "@/lib/constants";
import { usePoints } from "@/contexts/points-context";
import { useMiniApp } from "@/contexts/miniapp-context";

export default function Footer() {
  const { userPoints, isLoading } = usePoints();
  const { context } = useMiniApp();

  const handleFollowClick = async () => {
    await sdk.actions.viewProfile({
      fid: BEAMR_ACCOUNT_FID,
    });
  };

  const handleJoinClick = async () => {
    await sdk.actions.openUrl({ url: "https://farcaster.xyz/~/channel/beamr" });
  };

  const handleCastClick = async () => {
    await sdk.actions.composeCast({
      text: "beamr",
      embeds: [process.env.NEXT_PUBLIC_URL || ""],
    });
  };

  const handleAddMiniAppClick = async () => {
    if (!userPoints?.socialStatus?.appAdded) {
      await sdk.actions.addMiniApp();
    }
  };

  const appAdded = context?.client.added || userPoints?.socialStatus?.appAdded;

  if (isLoading || !userPoints?.walletAddress) return;

  return (
    <Flex direction="row" gap="4px" px="xs" py="sm">
      <Button
        onClick={handleFollowClick}
        h="70px"
        flex="1"
        style={{ minWidth: 0 }}
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <UserPlus size={20} />
            {userPoints?.socialStatus?.following && <CircleCheck size={16} />}
          </Flex>
          <Text size="8px" ta="center">
            Follow
          </Text>
        </Flex>
      </Button>

      <Button
        onClick={handleJoinClick}
        h="70px"
        flex="1"
        style={{ minWidth: 0 }}
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <MessageSquareText size={20} />
            {userPoints?.socialStatus?.inChannel && <CircleCheck size={16} />}
          </Flex>
          <Text size="8px" ta="center">
            Join
          </Text>
        </Flex>
      </Button>

      <Button
        onClick={handleCastClick}
        h="70px"
        flex="1"
        style={{ minWidth: 0 }}
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <MessageCircle size={20} />
            {userPoints?.socialStatus?.hasCast && <CircleCheck size={16} />}
          </Flex>
          <Text size="8px" ta="center">
            Post
          </Text>
        </Flex>
      </Button>

      <Button
        onClick={handleAddMiniAppClick}
        h="70px"
        flex="1"
        style={{ minWidth: 0 }}
        disabled={appAdded}
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <Plus size={20} />
            {appAdded && <CircleCheck size={16} />}
          </Flex>
          <Text size="8px" ta="center">
            Add App
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
}
