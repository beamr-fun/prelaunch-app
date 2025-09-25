"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Flex, Button, Group, Text } from "@mantine/core";
import { MessageCircle, MessageSquareText, UserPlus } from "lucide-react";

import { BEAMR_ACCOUNT_FID } from "@/lib/constants";

export default function Footer() {
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

  return (
    <Flex direction="row" gap="sm" px="sm" py="sm" justify="space-between">
      <Button
        variant="transparent"
        color="white"
        onClick={handleFollowClick}
        h="80px"
      >
        <Flex direction="column" align="center" gap="xs">
          <UserPlus size={20} />
          <Text size="10px">Follow @beamer</Text>
        </Flex>
      </Button>

      <Button
        variant="transparent"
        color="white"
        onClick={handleJoinClick}
        h="80px"
      >
        <Flex direction="column" align="center" gap="xs">
          <MessageSquareText size={20} />
          <Text size="10px"> Join /beamer</Text>
        </Flex>
      </Button>

      <Button
        variant="transparent"
        color="white"
        onClick={handleCastClick}
        h="80px"
      >
        <Flex direction="column" align="center" gap="xs">
          <MessageCircle size={20} />
          <Text size="10px"> Bull post</Text>
        </Flex>
      </Button>
    </Flex>
  );
}
