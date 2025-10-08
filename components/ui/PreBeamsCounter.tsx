"use client";

import { Flex, Text } from "@mantine/core";
import PointsDisplay from "./PointsDisplay";

interface PreBeamsCounterProps {
  points: number;
}

export default function PreBeamsCounter({ points }: PreBeamsCounterProps) {
  return (
    <Flex direction="column" align="center" gap="md">
      <Text size="xl" ta="center">
        Your Pre-Beams
      </Text>

      <PointsDisplay points={points} />

      <Text size="lg" ta="center" maw={300}>
        Do stuff to make the beamr launch a success. We&apos;re watching.
      </Text>
    </Flex>
  );
}
