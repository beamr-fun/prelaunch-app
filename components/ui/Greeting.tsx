import React from 'react';
import { Box, Button, Image, List, Paper, Text } from '@mantine/core';
import Diagram from './Diagram';

const Greeting = () => {
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
      <Text fz="sm" ta="center" mb="xl">
        A dynamic micro-subscription service
      </Text>
      <Paper>
        <Text mb={'sm'}>
          Beamr is the easiest way to sustainably reward the people who make
          your feed worth scrolling.
        </Text>
        <List mb={24}>
          <List.Item>You set monthly budget</List.Item>
          <List.Item>
            We dynamically split that stream based on your interactions (likes,
            comments, follows, etc.)
          </List.Item>
          <List.Item>
            Your favorite Farcasters start earning instantly & consistently
          </List.Item>
        </List>
        <Diagram />
        <Button size="lg">Join us</Button>
      </Paper>
    </Box>
  );
};

export default Greeting;
