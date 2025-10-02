"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Flex, Button, Group, Text } from "@mantine/core";
import {
  MessageCircle,
  MessageSquareText,
  UserPlus,
  Plus,
  CircleCheck,
} from "lucide-react";

import { BEAMR_ACCOUNT_FID } from "@/lib/constants";
import { usePoints } from "@/contexts/points-context";

export default function Footer() {
  const { userPoints } = usePoints();

  console.log("userPoints", userPoints);

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
    await sdk.actions.addMiniApp();
  };

  return (
    <Flex
      direction="row"
      gap="xs"
      px="xs"
      py="sm"
      justify="space-between"
      wrap="wrap"
    >
      <Button
        variant="transparent"
        color="white"
        onClick={handleFollowClick}
        h="70px"
        flex="1"
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <UserPlus size={20} />
            {userPoints?.socialStatus?.following && (
              <CircleCheck size={16} color="green" />
            )}
          </Flex>
          <Text size="8px" ta="center">
            Follow
          </Text>
        </Flex>
      </Button>

      <Button
        variant="transparent"
        color="white"
        onClick={handleJoinClick}
        h="70px"
        flex="1"
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <MessageSquareText size={20} />
            {userPoints?.socialStatus?.inChannel && (
              <CircleCheck size={16} color="green" />
            )}
          </Flex>
          <Text size="8px" ta="center">
            Join
          </Text>
        </Flex>
      </Button>

      <Button
        variant="transparent"
        color="white"
        onClick={handleCastClick}
        h="70px"
        flex="1"
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <MessageCircle size={20} />
            {userPoints?.socialStatus?.hasCast && (
              <CircleCheck size={16} color="green" />
            )}
          </Flex>
          <Text size="8px" ta="center">
            Post
          </Text>
        </Flex>
      </Button>

      <Button
        variant="transparent"
        color="white"
        onClick={handleAddMiniAppClick}
        h="70px"
        flex="1"
        disabled={userPoints?.socialStatus?.appAdded}
      >
        <Flex direction="column" align="center" gap="xs">
          <Flex align="center" gap="xs">
            <Plus size={20} />
            {userPoints?.socialStatus?.appAdded && (
              <CircleCheck size={16} color="green" />
            )}
          </Flex>
          <Text size="8px" ta="center">
            Add App
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
}
