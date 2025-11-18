'use client';

import React from 'react';
import { Box, Button, List, Paper, Text } from '@mantine/core';
import Diagram from '../ui/Diagram';

export default function Info() {
  return (
    <Box pt={'xl'}>
      <Paper mb="md">
        <Text fz="lg" mb="md" fw={500}>
          Not another tipping app
        </Text>
        <Text mb="sm">
          The difference between micro-tipping & out micro-subscription approach
          sounds trivial but will have profound effects stemming the slop tide.
        </Text>
        <Diagram />
      </Paper>
      <Paper>
        <Text fz="lg" mb="md" fw={500}>
          Beamr helps you shape your feed:
        </Text>
        <List mb="lg">
          <List.Item>{'Relational > Transactional'}</List.Item>
          <List.Item>{'Intentional > Mindless'}</List.Item>
          <List.Item>{'Taste > Aggregation'}</List.Item>
          <List.Item>{'Sustainable > Extractive'}</List.Item>
        </List>
        <Button size="lg">Learn More</Button>
      </Paper>
    </Box>
  );
}
