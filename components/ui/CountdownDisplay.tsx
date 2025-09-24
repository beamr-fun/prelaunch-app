"use client";

import { Text, Flex } from "@mantine/core";

interface CountdownDisplayProps {
  value: number;
  label: string;
}

export default function CountdownDisplay({
  value,
  label,
}: CountdownDisplayProps) {
  return (
    <Flex direction="row" align="flex-end">
      <Text size="2rem" fw={700} c="white">
        {value.toString().padStart(2, "0")}
      </Text>
      <Text size="sm" c="gray.4" fw={500}>
        {label}
      </Text>
    </Flex>
  );
}
