"use client";

import { MantineProvider } from "@mantine/core";
import { cssVariablesResolver, theme } from "@/lib/theme";
import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";
import { PointsProvider } from "@/contexts/points-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider addMiniAppOnLoad={true}>
      <UserProvider autoSignIn={true}>
        <PointsProvider>
          <MantineProvider
            theme={theme}
            withCssVariables
            defaultColorScheme="dark"
            cssVariablesResolver={cssVariablesResolver}
          >
            {children}
          </MantineProvider>
        </PointsProvider>
      </UserProvider>
    </MiniAppProvider>
  );
}
