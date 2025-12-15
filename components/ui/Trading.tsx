import { Anchor, Box, Button, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { SwapUI } from './Swap';

const FAIR_LAUNCH_TOTAL_ETH = '8.6135';

const FairLaunchTotal = ({ totalEth = '0' }: { totalEth?: string }) => {
  return (
    <Paper pos="relative">
      <Box
        pos="absolute"
        top={8}
        right={22}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Box
          w={10}
          h={10}
          bg="green"
          style={{
            borderRadius: '50%',
          }}
        />
        <Text fz="sm" fw={500}>
          Complete
        </Text>
      </Box>
      <Stack gap={4} align="center">
        <Text fz="xl" fw={600}>
          {totalEth} ETH
        </Text>
        <Text fz="md" c="gray.5">
          $BEAMR Fair Launch
        </Text>
      </Stack>
    </Paper>
  );
};

const UserFairLaunch = () => {
  const { colors } = useMantineTheme();

  return (
    <Paper>
      <Stack gap="md">
        <Text
          fz="lg"
          fw={500}
          ff="var(--font-kalam)"
          variant="gradient"
          gradient={{
            from: colors.blue[0],
            to: colors.blue[4],
            deg: 90,
          }}
        >
          Your Fair Launch $BEAMR Unlock
        </Text>
        <Button
          size="lg"
          fullWidth
          disabled
          c="gray.6"
          style={{
            border: '2px solid var(--mantine-color-dark-4)',
            background: 'transparent',
          }}
        >
          Coming Soon
        </Button>
      </Stack>
    </Paper>
  );
};

const Trading = () => {
  const { colors } = useMantineTheme();

  return (
    <Stack gap="lg">
      <FairLaunchTotal totalEth={FAIR_LAUNCH_TOTAL_ETH} />
      <Paper pb="sm">
        <Stack gap="md">
          <Text
            fz="lg"
            fw={500}
            ff="var(--font-kalam)"
            variant="gradient"
            gradient={{
              from: colors.blue[0],
              to: colors.blue[4],
              deg: 90,
            }}
          >
            Buy $BEAMR
          </Text>
          <SwapUI />
          <Anchor
            href="https://dexscreener.com/base/0xDd6c3d2cF60Eff29a3b9C27d677D6C97034894A4"
            target="_blank"
            ta="center"
            fz="sm"
            c="white"
            underline="always"
          >
            View Dexscreener
          </Anchor>
        </Stack>
      </Paper>
      <UserFairLaunch />
    </Stack>
  );
};

export default Trading;
