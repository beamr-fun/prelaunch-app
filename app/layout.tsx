import type { Metadata } from "next";
import { Flex } from "@mantine/core";
import Providers from "@/components/providers";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

import "@mantine/core/styles.css";
import "@/styles/fonts.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

export const metadata: Metadata = {
  title: "beamr",
  description: "beamr",
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
          <Flex direction="column" style={{ minHeight: "100vh" }}>
            <Header />
            <Flex style={{ flex: 1 }} direction="column">
              {children}
            </Flex>
            <Footer />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
