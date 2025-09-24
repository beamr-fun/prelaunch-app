import Providers from "@/components/providers";
import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";

import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "@/lib/theme";

const font = DM_Mono({ weight: "400", subsets: ["latin"] });

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
      </head>
      <body className={font.className}>
        <Providers>
          <MantineProvider>{children}</MantineProvider>
          {/* <MantineProvider theme={theme}>{children}</MantineProvider> */}
        </Providers>
      </body>
    </html>
  );
}
