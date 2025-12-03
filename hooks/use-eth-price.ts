import { useQuery } from '@tanstack/react-query';

export function useEthPrice() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: async () => {
      const res = await fetch('https://api.coinbase.com/v2/prices/eth-USD/buy');
      return await res.json();
    },
  });

  const ethPrice = data?.data?.amount ?? null;

  return { ethPrice, isLoading, isError };
}
