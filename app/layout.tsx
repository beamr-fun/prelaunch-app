import Providers from "@/components/providers";
import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import { Flex } from "@mantine/core";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
// import { cssVariablesResolver, theme } from "@/lib/theme";

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
          <MantineProvider>
            {/* <MantineProvider
            theme={theme}
            // withCssVariables
            // defaultColorScheme="dark"
            // cssVariablesResolver={cssVariablesResolver}
          > */}
            <Flex
              direction="column"
              style={{ minHeight: "100vh" }}
              bg="dark.8"
              c="white"
            >
              <Header />
              <Flex style={{ flex: 1 }} direction="column">
                {children}
              </Flex>
              <Footer />
            </Flex>
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
