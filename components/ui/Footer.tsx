"use client";

import { Flex, Button, Group, Text } from "@mantine/core";

import { MessageCircle, MessageSquareText, UserPlus } from "lucide-react";

interface FooterProps {
  onFollowClick?: () => void;
  onJoinClick?: () => void;
  onCastClick?: () => void;
}

export default function Footer({
  onFollowClick,
  onJoinClick,
  onCastClick,
}: FooterProps) {
  return (
    <Flex direction="row" gap="sm" px="sm" py="sm" justify="space-between">
      <Button
        variant="transparent"
        color="white"
        onClick={onFollowClick}
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
        onClick={onJoinClick}
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
        onClick={onCastClick}
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
