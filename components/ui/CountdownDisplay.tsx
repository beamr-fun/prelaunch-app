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
      <Text size="3rem">{value.toString().padStart(2, "0")}</Text>
      <Text size="xl" c="gray.4">
        {label}
      </Text>
    </Flex>
  );
}
