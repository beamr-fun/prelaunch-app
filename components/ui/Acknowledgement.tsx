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
              <List.Item mb="sm" c={colors.gray[3]}>
                Deposit ETH to buy $BEAMR in the first transaction from its
                locked LP upon creation.
              </List.Item>
              <List.Item mb="sm" c={colors.gray[3]}>
                Deposits/withdrawals are open until the token launch on December
                15th.
              </List.Item>
              <List.Item mb="sm" c={colors.gray[3]}>
                All participants get the same price based on total deposits
                (standard LP fees apply).
              </List.Item>
              <List.Item mb="sm" c={colors.gray[3]}>
                Fair sale tokens are locked for 24 hours after creation, then
                linearly streamed over 7 days.
              </List.Item>
              <List.Item mb="sm" c={colors.gray[3]}>
                Participants earn XP in the Beamr $SUP campaign. Earlier
                deposits get a higher multiplier.
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
