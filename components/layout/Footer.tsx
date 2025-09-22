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
    <Flex direction="row" gap="md" px="md" py="lg">
      <Group grow>
        <Button variant="transparent" color="white" onClick={onFollowClick}>
          <Flex direction="column" align="center">
            <UserPlus size={16} />
            <Text size="xs">Follow @beamer</Text>
          </Flex>
        </Button>
      </Group>

      <Group grow>
        <Button variant="transparent" color="white" onClick={onJoinClick}>
          <Flex direction="column" align="center">
            <MessageSquareText size={16} />
            <Text size="xs"> Join /beamer</Text>
          </Flex>
        </Button>
      </Group>

      <Group grow>
        <Button variant="transparent" color="white" onClick={onCastClick}>
          <Flex direction="column" align="center">
            <MessageCircle size={16} />
            <Text size="xs"> Bull post</Text>
          </Flex>
        </Button>
      </Group>
    </Flex>
  );
}
