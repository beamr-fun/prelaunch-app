import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Select,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import React from 'react';
import LaunchPhase from './LaunchPhase';
import { useUser } from '@/contexts/user-context';
import { useAccount } from 'wagmi';
import { usePoints } from '@/contexts/points-context';

export const WalletSelect = ({
  onWalletSelect,
  confirmWallet,
  selectedWallet,
}: {
  onWalletSelect: (addr: string) => void;
  confirmWallet: (addr: string) => Promise<void>;
  selectedWallet?: string;
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const { user } = useUser();
  const { address } = useAccount();
  const { isLoading: isWalletLoading } = usePoints();

  const primaryWallet =
    user?.data?.verified_addresses.primary.eth_address || '';
  const currentWallet = address || null;

  const { colors } = useMantineTheme();

  const truncateWallet = (wallet: string) => {
    const truncAddy = `${wallet.substring(0, 6)}...${wallet.substring(
      wallet.length - 4
    )}`;

    if (
      wallet.toLowerCase() === primaryWallet.toLowerCase() &&
      wallet.toLowerCase() === currentWallet?.toLowerCase()
    )
      return `${truncAddy} (primary, connected)`;
    if (wallet.toLowerCase() === primaryWallet.toLowerCase())
      return `${truncAddy} (primary)`;
    if (wallet.toLowerCase() === currentWallet?.toLowerCase())
      return `${truncAddy} (connected)`;
    return truncAddy;
  };

  const walletOptions = user?.data?.verified_addresses.eth_addresses.map(
    (addr) => ({ value: addr, label: truncateWallet(addr) })
  );

  const isButtonDisabled =
    isWalletLoading || !selectedWallet || isWalletLoading || isConfirming;

  const handleConfirm = async () => {
    if (selectedWallet) {
      setIsConfirming(true);
      await confirmWallet(selectedWallet);
      setIsConfirming(false);
    }
  };

  const handleChange = (value: string | null) => {
    if (value) {
      onWalletSelect(value);
    }
  };

  if (!user?.data) {
    // should not happen, but just in case
    return null;
  }

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
          <Text>We’re not beamin’ quite yet.</Text>
          <Text>
            Confirm your preferred wallet to earn a $SUP rewards stream & be
            ready for launch.
          </Text>
        </Stack>
        <Select
          disabled={isWalletLoading}
          label="Beamr Wallet"
          onChange={handleChange}
          placeholder="Pick wallet"
          value={selectedWallet}
          description="This is where we'll direct all your Beamr streams."
          data={walletOptions || []}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          mb="lg"
        />
        <Group justify="center">
          <Button size="lg" onClick={handleConfirm} disabled={isButtonDisabled}>
            Save
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};
