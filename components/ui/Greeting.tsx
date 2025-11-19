import React from 'react';
import {
  Box,
  Button,
  Image,
  List,
  Paper,
  Group,
  Text,
  useMantineTheme,
} from '@mantine/core';
import Diagram from './Diagram';

const Greeting = ({ confirmGreeted }: { confirmGreeted: () => void }) => {
  const { colors } = useMantineTheme();
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
      <Text
        // fz="sm"
        ta="center"
        mb="xl"
        fw={500}
        variant="gradient"
        gradient={{
          from: colors.blue[0],
          to: colors.blue[4],
          deg: 90,
        }}
      >
        A dynamic micro-subscription service
      </Text>
      <Paper>
        <Text mb={'sm'}>
          Beamr is the easiest way to sustainably reward the people who make
          your feed worth scrolling:
        </Text>
        <List mb={24}>
          <List.Item>You set a continuous token stream rate</List.Item>
          <List.Item>
            We dynamically split that stream based on your interactions (likes,
            comments, follows, etc.)
          </List.Item>
          <List.Item>
            Your favorite Farcasters start earning instantly & consistently
          </List.Item>
        </List>
        <Diagram />
        <Group justify="center">
          <Button size="lg" onClick={confirmGreeted}>
            Learn More (& Earn)
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};

export default Greeting;
