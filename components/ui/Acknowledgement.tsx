import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Checkbox,
  useMantineTheme,
} from '@mantine/core';

const Acknowledgement = ({
  setHasAcknowledge,
}: {
  setHasAcknowledge: () => void;
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [hasAcknowledge] = useState(() => {
    const hasAcknowledge = localStorage.getItem('hasAcknowledge');

    if (hasAcknowledge) {
      return true;
    }

    return false;
  });

  const { colors } = useMantineTheme();

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
            How it works
          </Text>
          <Stack gap="xs">
            <List>
              <List.Item fz="sm" mb="sm" c={colors.gray[3]}>
                Deposit ETH to buy $BEAMR in the first transaction from the new
                locked LP.
              </List.Item>
              <List.Item fz="sm" mb="sm" c={colors.gray[3]}>
                Deposits/withdrawals are open until token launch on December
                11th.
              </List.Item>
              <List.Item fz="sm" mb="sm" c={colors.gray[3]}>
                All participants get the same price based on total deposits
                (standard LP fees apply).
              </List.Item>
              <List.Item fz="sm" mb="sm" c={colors.gray[3]}>
                Tokens are locked 3 days, then linearly streamed out over 7.
              </List.Item>
              <List.Item fz="sm" mb="sm" c={colors.gray[3]}>
                Participants earn XP in our $SUP campaign.
              </List.Item>
            </List>
          </Stack>
          <Checkbox
            checked={isChecked || hasAcknowledge}
            label="I acknowledge: $BEAMR is a utility token for streaming. No representations are made on its value or development. NFA."
            disabled={hasAcknowledge}
            c={colors.gray[3]}
            onChange={(e) => setIsChecked(e.currentTarget.checked)}
          />
          <Group justify="center">
            <Button
              size="lg"
              disabled={!isChecked && !hasAcknowledge}
              onClick={setHasAcknowledge}
            >
              Continue
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Acknowledgement;
