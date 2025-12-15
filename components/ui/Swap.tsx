import { useState, useEffect, useCallback } from 'react';
import classes from '../../styles/swap.module.css';
import { useDebouncedValue } from '@mantine/hooks';
import { Box, Button, Flex, Group, Loader, Text } from '@mantine/core';
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatUnits, parseUnits, Address, Hex } from 'viem';
import { useEthPrice } from '@/hooks/use-eth-price';

const BEAMR_ADDRESS = '0x22F1cd353441351911691EE4049c7b773abb1ecF';
const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const BASE_CHAIN_ID = 8453;

type QuoteResponse = {
  sellAmount: string;
  buyAmount: string;
  transaction: {
    to: Address;
    data: Hex;
    value: string;
    gas: string;
    gasPrice: string;
  };
};

export const SwapUI = ({ canSwap = true }: { canSwap?: boolean }) => {
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [inputMode, setInputMode] = useState<'sell' | 'buy'>('sell');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [priceRate, setPriceRate] = useState<number | null>(null);

  const { address, isConnected } = useAccount();
  const { ethPrice } = useEthPrice();

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: BASE_CHAIN_ID,
  });

  const { data: beamrBalance, refetch: refetchBeamrBalance } = useBalance({
    address,
    token: BEAMR_ADDRESS,
    chainId: BASE_CHAIN_ID,
  });

  const {
    sendTransaction,
    data: txHash,
    isPending: isSending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [debouncedSellAmount] = useDebouncedValue(sellAmount, 500);
  const [debouncedBuyAmount] = useDebouncedValue(buyAmount, 500);

  useEffect(() => {
    const fetchPriceRate = async () => {
      if (!address) {
        return;
      }

      try {
        const params = new URLSearchParams({
          endpoint: `/swap/permit2/quote`,
          chainId: BASE_CHAIN_ID.toString(),
          sellToken: NATIVE_TOKEN,
          buyToken: BEAMR_ADDRESS,
          sellAmount: parseUnits('0.01', 18).toString(),
          taker: address,
        });
        const response = await fetch(`/api/swap?${params.toString()}`);
        const data = await response.json();

        if (response.ok && data.buyAmount && data.sellAmount) {
          const sell = parseFloat(formatUnits(BigInt(data.sellAmount), 18));
          const buy = parseFloat(formatUnits(BigInt(data.buyAmount), 18));

          setPriceRate(buy / sell);
        }
      } catch (err) {
        console.error('Failed to fetch price rate:', err);
      }
    };

    fetchPriceRate();
  }, [address]);

  const fetchQuote = useCallback(async () => {
    let ethAmount: string;

    if (inputMode === 'sell') {
      if (
        !debouncedSellAmount ||
        parseFloat(debouncedSellAmount) <= 0 ||
        !address
      ) {
        setQuote(null);
        setBuyAmount('');

        return;
      }

      ethAmount = debouncedSellAmount;
    } else {
      if (
        !debouncedBuyAmount ||
        parseFloat(debouncedBuyAmount) <= 0 ||
        !address ||
        !priceRate
      ) {
        setQuote(null);
        setSellAmount('');

        return;
      }
      const beamrWanted = parseFloat(debouncedBuyAmount);

      ethAmount = (beamrWanted / priceRate).toFixed(18);
    }

    setIsLoadingQuote(true);
    setError('');

    try {
      const sellAmountWei = parseUnits(ethAmount, 18).toString();

      const params = new URLSearchParams({
        endpoint: `/swap/permit2/quote`,
        chainId: BASE_CHAIN_ID.toString(),
        sellToken: NATIVE_TOKEN,
        buyToken: BEAMR_ADDRESS,
        sellAmount: sellAmountWei,
        taker: address,
      });

      const response = await fetch(`/api/swap?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Quote error:', data);

        const errorMsg =
          data.message || data.error || data.reason || 'Failed to get quote';

        throw new Error(errorMsg);
      }

      if (!data.buyAmount || !data.sellAmount || !data.transaction) {
        console.error('Invalid quote response:', data);

        throw new Error(
          data.reason || data.description || 'Invalid quote response'
        );
      }

      setQuote(data);

      const sell = parseFloat(formatUnits(BigInt(data.sellAmount), 18));
      const buy = parseFloat(formatUnits(BigInt(data.buyAmount), 18));

      setPriceRate(buy / sell);

      if (inputMode === 'sell') {
        setBuyAmount(buy.toFixed(2));
      } else {
        setSellAmount(sell.toFixed(6));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      setQuote(null);

      if (inputMode === 'sell') {
        setBuyAmount('');
      } else {
        setSellAmount('');
      }
    } finally {
      setIsLoadingQuote(false);
    }
  }, [debouncedSellAmount, debouncedBuyAmount, inputMode, address, priceRate]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    if (isSuccess) {
      setSellAmount('');
      setBuyAmount('');
      setQuote(null);
      refetchEthBalance();
      refetchBeamrBalance();

      setSuccessMessage('Swap successful!');

      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [isSuccess, refetchEthBalance, refetchBeamrBalance]);

  const handleSwap = async () => {
    if (!quote || !address || !quote.transaction) return;

    setError('');

    try {
      sendTransaction({
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: quote.transaction.value
          ? BigInt(quote.transaction.value)
          : BigInt(0),
        ...(quote.transaction.gas
          ? { gas: BigInt(quote.transaction.gas) }
          : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed');
    }
  };

  const insufficientBalance =
    parseFloat(sellAmount) > parseFloat(ethBalance?.formatted || '0');

  const getButtonText = () => {
    if (!isConnected) {
      return 'Connect Wallet';
    }

    if (isSending) {
      return 'Confirming...';
    }

    if (isConfirming) {
      return 'Processing...';
    }

    if (insufficientBalance) {
      return 'Insufficient Balance';
    }

    return 'Buy BEAMR';
  };

  const isButtonDisabled =
    !canSwap ||
    !isConnected ||
    !quote ||
    isLoadingQuote ||
    isSending ||
    isConfirming ||
    parseFloat(sellAmount) <= 0 ||
    insufficientBalance;

  const sellDollarAmount =
    sellAmount && ethPrice
      ? (parseFloat(sellAmount) * parseFloat(ethPrice)).toFixed(2)
      : null;

  const buyDollarAmount =
    buyAmount && priceRate && ethPrice
      ? ((parseFloat(buyAmount) / priceRate) * parseFloat(ethPrice)).toFixed(2)
      : null;

  return (
    <Box>
      <Flex gap="4" direction="column" pos="relative" mb="md">
        <SwapInputCard
          orientation="From"
          balance={ethBalance?.formatted || '0'}
          onChange={(e) => {
            setSellAmount(e.target.value);
            setInputMode('sell');
          }}
          value={sellAmount}
          unit="ETH"
          loading={isLoadingQuote && inputMode === 'buy'}
          dollarAmount={sellDollarAmount}
        />
        <SwapInputCard
          orientation="To"
          balance={beamrBalance?.formatted || '0'}
          onChange={(e) => {
            setBuyAmount(e.target.value);
            setInputMode('buy');
          }}
          value={buyAmount}
          unit="BEAMR"
          loading={isLoadingQuote && inputMode === 'sell'}
          dollarAmount={buyDollarAmount}
        />
      </Flex>
      {error && (
        <Text c="red" size="sm" mb="md" ta="center">
          {error}
        </Text>
      )}
      {successMessage && (
        <Text c="green" size="sm" mb="md" ta="center">
          {successMessage}
        </Text>
      )}
      <Group justify="center">
        <Button
          size="lg"
          onClick={handleSwap}
          disabled={isButtonDisabled}
          loading={isSending || isConfirming}
        >
          {getButtonText()}
        </Button>
      </Group>
    </Box>
  );
};

type SwapCardProps = {
  orientation: 'From' | 'To';
  balance?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  unit: string;
  error?: string | null;
  loading?: boolean;
  dollarAmount?: string | null;
};

const SwapInputCard = ({
  orientation,
  balance,
  onChange,
  value,
  unit,
  error,
  loading = false,
  dollarAmount,
}: SwapCardProps) => {
  return (
    <div className={classes.wrapper} data-error={error ? 'true' : 'false'}>
      <label className={classes.label}>Swap {orientation}</label>
      <div className={classes.inner}>
        {loading ? (
          <Loader size="sm" />
        ) : (
          <input
            className={classes.input}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            min="0"
            value={value}
            onChange={onChange}
            placeholder="0"
            onKeyDown={(e) => {
              const allowedKeys = [
                'Backspace',
                'Delete',
                'Tab',
                'ArrowLeft',
                'ArrowRight',
                'Home',
                'End',
              ];
              if (allowedKeys.includes(e.key)) {
                return;
              }

              if (
                e.key === '.' &&
                !(e.target as HTMLInputElement).value.includes('.')
              ) {
                return;
              }

              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        )}
        <p className={classes.unit}>{unit}</p>
      </div>
      <Flex justify="space-between" align="center">
        <Text fz="sm" c="gray.5">
          {dollarAmount ? `$${dollarAmount}` : '$0'}
        </Text>
        <p className={classes.balance}>
          Balance: {parseFloat(balance || '0').toFixed(4)}
        </p>
      </Flex>
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

