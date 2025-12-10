import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useConfig } from 'wagmi';
import { formatEther, parseAbi, parseEther } from 'viem';
import { base } from 'wagmi/chains';
import Acknowledgement from './Acknowledgement';
import FairLaunchTable from './FairLaunchTable';
import { useEthPrice } from '@/hooks/use-eth-price';
import { Info } from 'lucide-react';

const PREBUY_ADDRESS = '0x66b2da319db8964f7df6e24bd9695f4a45d6d135' as const;
const MIN_DEPOSIT = 0.01;
const MAX_DEPOSIT = 100;

const Prebuy = () => {
  const [hasAcknowledge, setHasAcknowledge] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { colors } = useMantineTheme();
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const { ethPrice } = useEthPrice();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: base.id,
    query: { enabled: !!address, refetchInterval: 10000 },
  });
  const { data: totalBalance, refetch: refetchTotalBalance } = useReadContract({
    address: PREBUY_ADDRESS,
    abi: parseAbi(['function totalBalance() view returns (uint256)']),
    functionName: 'totalBalance',
    chainId: base.id,
    query: { refetchInterval: 10000 },
  });
  const { data: userDeposit, refetch: refetchUserDeposit } = useReadContract({
    address: PREBUY_ADDRESS,
    abi: parseAbi(['function deposits(address) view returns (uint256)']),
    functionName: 'deposits',
    args: [address!],
    chainId: base.id,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const refetchAll = () => {
    refetchBalance();
    refetchTotalBalance();
    refetchUserDeposit();
  };

  const formattedTotalBalance = totalBalance
    ? new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4,
      }).format(parseFloat(formatEther(totalBalance)))
    : '0';

  const formattedUserDeposit = userDeposit
    ? new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4,
      }).format(parseFloat(formatEther(userDeposit)))
    : '0';

  const hasUserDeposit = userDeposit && userDeposit > BigInt(0);

  const formattedBalance = balance
    ? parseFloat(balance.formatted).toFixed(4)
    : '0';

  const depositValue = parseFloat(depositAmount) || 0;
  const dollarAmount =
    ethPrice && depositValue
      ? (depositValue * parseFloat(ethPrice)).toFixed(2)
      : null;
  const isBelowMin = depositAmount !== '' && depositValue < MIN_DEPOSIT;
  const isAboveMax = depositValue > MAX_DEPOSIT;
  const isInsufficientBalance =
    balance && depositValue > parseFloat(balance.formatted);
  const isValidAmount =
    depositAmount !== '' &&
    !isBelowMin &&
    !isAboveMax &&
    !isInsufficientBalance;

  const handleDeposit = async () => {
    if (!depositAmount || !address) return;

    const amountWei = parseEther(depositAmount);

    try {
      const hash = await writeContractAsync({
        address: PREBUY_ADDRESS,
        abi: parseAbi(['function deposit() payable']),
        functionName: 'deposit',
        value: amountWei,
        chainId: base.id,
      });

      setDepositAmount('');

      await waitForTransactionReceipt(config, {
        hash,
        chainId: base.id,
        confirmations: 3,
      });

      refetchAll();
      setSuccessMessage('Deposit successful!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    if (!userDeposit || !address) return;

    try {
      const hash = await writeContractAsync({
        address: PREBUY_ADDRESS,
        abi: parseAbi(['function withdraw(uint256 amount)']),
        functionName: 'withdraw',
        args: [userDeposit],
        chainId: base.id,
      });

      await waitForTransactionReceipt(config, {
        hash,
        chainId: base.id,
        confirmations: 3,
      });

      refetchAll();
      setSuccessMessage('Withdrawal successful!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const hasAcknowledge = localStorage.getItem('hasAcknowledge');

    if (hasAcknowledge) {
      setHasAcknowledge(true);
    }
  }, []);

  return (
    <Box>
      <Stack gap="lg">
        <Image
          src="./images/beamrLogo.png"
          alt="Beamr Logo"
          width={80}
          height={80}
          mb="md"
          fit="contain"
        />
        <Box>
          <Paper pos="relative">
            <Box
              pos="absolute"
              top={16}
              right={16}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Box
                w={12}
                h={12}
                bg="red"
                style={{
                  borderRadius: '50%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <Text fz="md" fw={500}>
                Live
              </Text>
            </Box>
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}
            </style>
            <Stack>
              <Text
                fz="lg"
                fw={500}
                variant="gradient"
                gradient={{
                  from: colors.blue[0],
                  to: colors.blue[4],
                  deg: 90,
                }}
              >
                $BEAMR Fair Launch
              </Text>
              <Text>
                In most "fair launches" normal users can't compete with snipers.
              </Text>
              <Text>We're doing it differently.</Text>
              {hasAcknowledge && (
                <Group justify="center">
                  <Button size="lg" onClick={() => setHasAcknowledge(false)}>
                    Review Details
                  </Button>
                </Group>
              )}
            </Stack>
          </Paper>
        </Box>
        {hasAcknowledge && (
          <Box>
            <Paper>
              <Stack align="center" gap={4} mb="md">
                <Text fz="xl" fw={600}>
                  {formattedTotalBalance} ETH
                </Text>
                <Text fz="sm" c="gray.5">
                  Fair Launch Deposit
                </Text>
              </Stack>
              <Box>
                <Stack>
                  <Paper
                    style={{
                      backgroundColor: 'var(--glass-thick)',
                      padding: '12px',
                    }}
                  >
                    <Text fz="sm" c="gray.4" mb={4}>
                      Deposit
                    </Text>
                    <Group justify="space-between" align="center" gap="xs">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={depositAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                            setDepositAmount(value);
                          }
                        }}
                        style={{
                          fontSize: '24px',
                          fontWeight: 500,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--mantine-color-gray-0)',
                          flex: 1,
                          width: '100%',
                          minWidth: 0,
                        }}
                      />
                      <Text fz="lg" fw={500} c="gray.4">
                        ETH
                      </Text>
                    </Group>
                    <Group justify="space-between" mt={4}>
                      {isBelowMin ? (
                        <Text fz="xs" c="red">
                          ({MIN_DEPOSIT} ETH Minimum)
                        </Text>
                      ) : isAboveMax ? (
                        <Text fz="xs" c="red">
                          ({MAX_DEPOSIT} ETH Maximum)
                        </Text>
                      ) : isInsufficientBalance ? (
                        <Text fz="xs" c="red">
                          (Insufficient Balance)
                        </Text>
                      ) : (
                        <Text fz="xs" c="gray.5">
                          ${dollarAmount || '0'}
                        </Text>
                      )}
                      <Text fz="xs" c="gray.5">
                        Balance: {formattedBalance}
                      </Text>
                    </Group>
                  </Paper>
                  <Group wrap="nowrap" align="flex-start" gap="xs">
                    <Info
                      size={20}
                      color="var(--mantine-color-red-5)"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <Text fz="xs" c="red">
                      IMPORTANT: The number of BEAMR you will receive depends on
                      the total ETH deposited (see estimates below). Your tokens
                      will be locked when trading opens.
                    </Text>
                  </Group>
                  <Button
                    size="lg"
                    fullWidth
                    mt="md"
                    onClick={handleDeposit}
                    disabled={!isValidAmount}
                  >
                    Deposit
                  </Button>
                  {successMessage && (
                    <Text fz="sm" c="green" ta="center">
                      {successMessage}
                    </Text>
                  )}
                  {hasUserDeposit && (
                    <Text
                      fz="sm"
                      ta="center"
                      td="underline"
                      style={{ cursor: 'pointer' }}
                      onClick={handleWithdraw}
                    >
                      Withdraw Deposit: {formattedUserDeposit} ETH
                    </Text>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Box>
        )}
        {!hasAcknowledge ? (
          <Acknowledgement
            setHasAcknowledge={() => {
              localStorage.setItem('hasAcknowledge', 'true');
              setHasAcknowledge(true);
            }}
          />
        ) : (
          <FairLaunchTable />
        )}
      </Stack>
    </Box>
  );
};

export default Prebuy;
