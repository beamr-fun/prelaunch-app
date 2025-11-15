'use client';

import { useUser } from '@/contexts/user-context';
import { Avatar, Flex } from '@mantine/core';

export default function Header() {
  const { user } = useUser();
  return (
    <Flex justify="end" align="center">
      <Avatar
        src={user?.data?.pfp_url || undefined}
        size={32}
        alt="User Avatar"
      />
    </Flex>
  );
}
