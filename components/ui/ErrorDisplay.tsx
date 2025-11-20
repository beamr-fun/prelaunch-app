import { Card, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

const ErrorDisplay = ({
  title,
  errorMsg,
}: {
  title?: string;
  errorMsg?: string;
}) => {
  const { colors } = useMantineTheme();
  return (
    <Paper>
      <Group mb="sm">
        <TriangleAlert size={48} color={colors.red[7]} />
        <Text fz={'lg'} fw={700}>
          {title || 'Error'}
        </Text>
      </Group>
      <Text>{errorMsg || 'Unknown Error'}</Text>
    </Paper>
  );
};

export default ErrorDisplay;
