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
import Acknowledgement from './Acknowledgement';
import FairLaunchTable from './FairLaunchTable';

const Prebuy = () => {
  const [hasAcknowledge, setHasAcknowledge] = useState(false);

  const { colors } = useMantineTheme();

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
