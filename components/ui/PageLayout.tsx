import { Box } from '@mantine/core';
import { ReactNode } from 'react';
import { PageTitle } from './PageTitle';

export const PageLayout = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  return (
    <Box pt={title ? undefined : 'xl'}>
      {title && <PageTitle title={title} />}
      {children}
    </Box>
  );
};
