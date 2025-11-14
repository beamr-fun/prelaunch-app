import type { Metadata } from 'next';
import { Flex } from '@mantine/core';
import Providers from '@/components/providers';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

import '@mantine/core/styles.css';
import '@/styles/fonts.css';
import classes from '@/styles/layout.module.css';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

export const metadata: Metadata = {
  title: 'BEAMR',
  description: 'BEAMR',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <Flex
            direction="column"
            style={{ minHeight: '100vh' }}
            className={classes.appBackground}
          >
            <svg
              width="0"
              height="0"
              style={{ position: 'absolute' }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient
                  id="beamr-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="var(--mantine-color-blue-5)" />
                  <stop offset="100%" stopColor="var(--mantine-color-blue-7)" />
                </linearGradient>
              </defs>
            </svg>
            <Header />
            <Flex style={{ flex: 1 }} direction="column">
              {children}
            </Flex>
            {/* <Footer /> */}
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
