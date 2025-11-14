'use client';

import { useUser } from '@/contexts/user-context';
import { Avatar, Flex, Text } from '@mantine/core';

export default function Header() {
  const { user } = useUser();
  return (
    <Flex justify="end" align="center" py="sm">
      <Avatar
        src={user?.data?.pfp_url || undefined}
        size={32}
        alt="User Avatar"
      />
    </Flex>
  );
}
