import { useState } from 'react';
import {
  Box,
  Button,
  Group,
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

  const { colors } = useMantineTheme();
  console.log(isChecked);

  return (
    <Box>
      <Paper>
        <Stack>
          <Text fz="lg" fw={500}>
            Details & Acknowledgement
          </Text>
          <Stack gap="xs">
            <Text fz="sm" c={colors.gray[3]}>
              - Deposit ETH to immediately buy $BEAMR from the locked LP created
              at launch.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - Deposits and withdrawals are open until token launch on December
              10th (TBA).
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - The total ETH in the batch purchase determines the executed
              token price.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - This price is uniform for all depositors.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - The deposited ETH (minus standard LP fees) go directly to the
              $BEAMR LP.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - Fair launch token purchases are locked for 5 days.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - Fair launch participants will receive XP in the Beamr $SUP
              campaign.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - $BEAMR is a utility token for streaming.
            </Text>
            <Text fz="sm" c={colors.gray[3]}>
              - The Beamr team makes no representations about $BEAMR's value or
              future development.
            </Text>
          </Stack>
          <Checkbox
            label="I acknowledge the above terms & conditions. No information provided by the Beamr team has been interpreted as financial advice."
            c={colors.gray[3]}
            onChange={(e) => setIsChecked(e.currentTarget.checked)}
          />
          <Group justify="center">
            <Button size="lg" disabled={!isChecked} onClick={setHasAcknowledge}>
              Continue
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Acknowledgement;
