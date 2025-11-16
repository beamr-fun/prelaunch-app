'use-client';

import { Group, Text } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export const PageTitle = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <Group gap={12} mb={32}>
      <ArrowLeft
        onClick={() => {
          router.back();
        }}
        strokeWidth={1}
        size={24}
        style={{
          cursor: 'pointer',
          color: 'var(--mantine-color-gray-0)',
        }}
      />
      <Text fz="xl">{title}</Text>
    </Group>
  );
};
