import { Anchor, Box, Button, Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { gdaPoolAbi, gdaForwarderAbi } from '@sfpro/sdk/abi';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { base } from 'viem/chains';
import { formatSubscriptPrice } from '@/lib/format';
import { SwapUI } from './Swap';

const FAIR_LAUNCH_TOTAL_ETH = '8.6235';
const POOL_ADDRESS = '0x7De8a3e8379d337a1E8888d0175E1211Fe611c01';
const GDA_FORWARDER_ADDRESS = '0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08';
const ENTRY_PRICE = 0.00000071638;

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
  const { address } = useAccount();

  const { data: units } = useReadContract({
    address: POOL_ADDRESS,
    abi: gdaPoolAbi,
    functionName: 'getUnits',
    args: [address!],
    chainId: base.id,
    query: { enabled: !!address },
  });

  const { writeContract, isPending } = useWriteContract();

  const handleConnect = () => {
    writeContract({
      address: GDA_FORWARDER_ADDRESS,
      abi: gdaForwarderAbi,
      functionName: 'connectPool',
      args: [POOL_ADDRESS, '0x'],
      chainId: base.id,
    });
  };

  if (!units || units === BigInt(0)) {
    return null;
  }

  const depositEth = formatEther(units);

  return (
    <Paper style={{ width: '100%' }}>
      <Stack gap="md" style={{ width: '100%' }}>
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
          Your Fair Launch
        </Text>
        <Group grow>
          <Box>
            <Text fz="sm" c="gray.5">
              Deposit
            </Text>
            <Text fz="lg" fw={600}>
              {parseFloat(depositEth).toFixed(4)} ETH
            </Text>
          </Box>
          <Box>
            <Text fz="sm" c="gray.5">
              Entry
            </Text>
            <Text fz="lg" fw={600}>
              ${formatSubscriptPrice(ENTRY_PRICE)}
            </Text>
          </Box>
        </Group>
        <Button size="lg" fullWidth onClick={handleConnect} loading={isPending}>
          Connect to Pool
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
      <UserFairLaunch />
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
    </Stack>
  );
};

export default Trading;
