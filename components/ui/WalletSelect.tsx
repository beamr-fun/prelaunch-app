import {
  Box,
  Button,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import React from 'react';
import LaunchPhase from './LaunchPhase';

export const WalletSelect = () => {
  const { colors } = useMantineTheme();
  return (
    <Box>
      <Image
        src="./images/beamrLogo.png"
        alt="Beamr Logo"
        width={80}
        height={80}
        mb="md"
        fit="contain"
      />
      <LaunchPhase />
      <Paper>
        <Text fz="lg" c={colors.gray[0]} fw={500} mb="md">
          Beamr wallet
        </Text>
        <Stack gap="sm" mb="lg">
          <Text>
            We’re not beamin’ quite yet, but have opportunities for you to make
            it a successful launch.
          </Text>
          <Text>
            Confirm your preferred wallet to earn your first $SUP token stream
            reward.
          </Text>
          <Text>
            Upon launch, this is where we’ll direct all your Beamr streams.
          </Text>
        </Stack>
        <Select
          label="Address"
          placeholder="Pick value"
          description="This is a description"
          data={['React', 'Angular', 'Vue', 'Svelte']}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          mb="lg"
        />
        <Button size="lg">Save</Button>
      </Paper>
    </Box>
  );
};
