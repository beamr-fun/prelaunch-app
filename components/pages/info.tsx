'use client';

import React from 'react';
import { Box, List, Paper, Text, useMantineTheme } from '@mantine/core';
import Diagram from '../ui/Diagram';

export default function Info() {
  const { colors } = useMantineTheme();

  return (
    <Box pt={'xl'}>
      <Paper mb="md">
        <Text
          fz="lg"
          fw={500}
          mb="md"
          variant="gradient"
          gradient={{
            from: colors.blue[0],
            to: colors.blue[4],
            deg: 90,
          }}
        >
          Not another tipping app
        </Text>
        <Text mb="sm">
          Beamr is the easiest way to sustainably reward the people who make
          your feed worth scrolling:
        </Text>
        <List type="ordered" mb="lg">
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
      </Paper>
      <Paper>
        <Text
          fz="lg"
          fw={500}
          mb="md"
          variant="gradient"
          gradient={{
            from: colors.blue[0],
            to: colors.blue[4],
            deg: 90,
          }}
        >
          Beamr helps you shape your feed:
        </Text>
        <List>
          <List.Item>{'Relational > Transactional'}</List.Item>
          <List.Item>{'Intentional > Mindless'}</List.Item>
          <List.Item>{'Taste > Aggregation'}</List.Item>
          <List.Item>{'Sustainable > Extractive'}</List.Item>
        </List>
      </Paper>
    </Box>
  );
}
