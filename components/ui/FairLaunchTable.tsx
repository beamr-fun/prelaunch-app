import { useMemo } from 'react';
import {
  Box,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useEthPrice } from '@/hooks/use-eth-price';

const tableData = [
  {
    ethAmount: 1,
    tokenAmount: 8591975963,
    ethPerToken: 0.0000000001163,
    newPriceEth: 0.000000000136,
    fdvEth: 13.6,
  },
  {
    ethAmount: 2,
    tokenAmount: 15031453768,
    ethPerToken: 0.000000000133,
    newPriceEth: 0.0000000001777,
    fdvEth: 17.77,
  },
  {
    ethAmount: 3,
    tokenAmount: 20037269856,
    ethPerToken: 0.0000000001497,
    newPriceEth: 0.000000000225,
    fdvEth: 22.5,
  },
  {
    ethAmount: 4,
    tokenAmount: 24040243944,
    ethPerToken: 0.0000000001663,
    newPriceEth: 0.0000000002779,
    fdvEth: 27.79,
  },
  {
    ethAmount: 5,
    tokenAmount: 27314295260,
    ethPerToken: 0.000000000183,
    newPriceEth: 0.0000000003363,
    fdvEth: 33.63,
  },
  {
    ethAmount: 10,
    tokenAmount: 37539276030,
    ethPerToken: 0.0000000002663,
    newPriceEth: 0.000000000712,
    fdvEth: 71.2,
  },
  {
    ethAmount: 15,
    tokenAmount: 42891333855,
    ethPerToken: 0.0000000003497,
    newPriceEth: 0.000000001227,
    fdvEth: 122.7,
  },
  {
    ethAmount: 20,
    tokenAmount: 46183581700,
    ethPerToken: 0.000000000433,
    newPriceEth: 0.000000001881,
    fdvEth: 188.13,
  },
];

const FairLaunchTable = () => {
  const { colors } = useMantineTheme();
  const { ethPrice, isLoading } = useEthPrice();

  const rows = useMemo(() => {
    if (isLoading) {
      return [];
    }

    return tableData.map((element) => (
      <Table.Tr key={element.ethAmount}>
        <Table.Td>{element.ethAmount} ETH</Table.Td>
        <Table.Td>${(element.ethPerToken * ethPrice).toFixed(8)}</Table.Td>
        <Table.Td>${(element.newPriceEth * ethPrice).toFixed(8)}</Table.Td>
        <Table.Td>
          $
          {Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 2,
          }).format(element.fdvEth * ethPrice)}
        </Table.Td>
      </Table.Tr>
    ));
  }, [ethPrice, isLoading]);

  return (
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
            Fair Launch Scenarios
          </Text>
          {isLoading ? (
            <Group justify="center">
              <Loader color="var(--glass-thick)" />
            </Group>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Community Deposit</Table.Th>
                  <Table.Th>Community Buy Price</Table.Th>
                  <Table.Th>Open LP Price</Table.Th>
                  <Table.Th>Implied FDV</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default FairLaunchTable;
