import { Box, Group, Text } from '@mantine/core';
import React from 'react';

const LaunchPhase = () => {
  return (
    <Box mt="md">
      <Group justify="center" mb={2}>
        <Box pos="relative" w={235} h={20}>
          <Box
            pos="absolute"
            h={16}
            w={16}
            bg="linear-gradient(90deg, var(--mantine-color-blue-7), var(--mantine-color-blue-5))"
            bdrs={100}
          />
          <Box
            pos="absolute"
            w={84}
            top={8}
            left={20}
            h={2}
            bg="var(--mantine-color-gray-7)"
          />
          <Box
            pos="absolute"
            left={109}
            h={16}
            w={16}
            bg="var(--mantine-color-gray-7)"
            bdrs={100}
          />
          <Box
            pos="absolute"
            w={84}
            top={8}
            left={130}
            h={2}
            bg="var(--mantine-color-gray-7)"
          />
          <Box
            pos="absolute"
            h={16}
            w={16}
            left={219}
            bg="var(--mantine-color-gray-7)"
            bdrs={100}
          />
        </Box>
      </Group>
      <Group justify="center" mb={'lg'}>
        <Box pos="relative" w={300} h={19}>
          <Text fz="sm" pos="absolute" left={5}>
            $SUP Rewards
          </Text>
          <Text fz="sm" pos="absolute" left={115}>
            Token launch
          </Text>
          <Text fz="sm" pos="absolute" left={235}>
            App launch
          </Text>
        </Box>
      </Group>
    </Box>
  );
};

export default LaunchPhase;
