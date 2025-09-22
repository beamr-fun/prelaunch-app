"use client";

import { Flex, Text, ActionIcon } from "@mantine/core";

export default function Header() {
  return (
    <Flex justify="space-between" align="center" px="md" py="sm">
      <Text size="xl" fw={700} c="white">
        beamr
      </Text>
    </Flex>
  );
}
