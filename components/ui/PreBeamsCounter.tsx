"use client";

import { Flex, Text, Paper } from "@mantine/core";
import PointsDisplay from "./PointsDisplay";

interface PreBeamsCounterProps {
  points: number;
}

export default function PreBeamsCounter({ points }: PreBeamsCounterProps) {
  return (
    <Flex direction="column" align="center" gap="md">
      <Text size="xl" fw={600} c="white" ta="center">
        Your Pre-Beams
      </Text>

      <PointsDisplay points={points} size="large" />

      <Text size="sm" c="white" ta="center" maw={300}>
        Do stuff to make the beamr launch a success. We&apos;re watching.
      </Text>
    </Flex>
  );
}
