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
  const { writeContract } = useWriteContract();
  const { address } = useAccount();
  const { ethPrice } = useEthPrice();
  const { data: balance } = useBalance({ address, chainId: base.id });
  const { data: totalBalance } = useReadContract({
    address: PREBUY_ADDRESS,
    abi: parseAbi(['function totalBalance() view returns (uint256)']),
    functionName: 'totalBalance',
    chainId: base.id,
  });
  const { data: userDeposit } = useReadContract({
    address: PREBUY_ADDRESS,
    abi: parseAbi(['function deposits(address) view returns (uint256)']),
    functionName: 'deposits',
    args: [address ?? '0x'],
    chainId: base.id,
  });

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
  const isValidAmount = depositAmount !== '' && !isBelowMin && !isAboveMax;

  const handleDeposit = () => {
    if (!depositAmount) return;

    const amountWei = parseEther(depositAmount);

    writeContract(
      {
        address: PREBUY_ADDRESS,
        abi: parseAbi(['function deposit(uint256) payable']),
        functionName: 'deposit',
        args: [amountWei],
        value: amountWei,
        chainId: base.id,
      },
      {
        onSuccess: () => {
          setDepositAmount('');
          setSuccessMessage('Deposit submitted successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        },
        onError: (error) => {
          console.info(error);
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!userDeposit) return;

    writeContract(
      {
        address: PREBUY_ADDRESS,
        abi: parseAbi(['function withdraw(uint256 amount)']),
        functionName: 'withdraw',
        args: [userDeposit],
        chainId: base.id,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Withdrawal submitted successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        },
        onError: (error) => {
          console.info(error);
        },
      }
    );
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
          <Paper>
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
              <Text fz="sm">
                Even in most "fair launches" normal users can't compete with
                snipers.
              </Text>
              <Text fz="sm">
                That's why we're bundling a community token buy in the $BEAMR
                launch.
              </Text>
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
