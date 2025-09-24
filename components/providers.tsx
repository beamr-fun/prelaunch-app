"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";
import { PointsProvider } from "@/contexts/points-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider addMiniAppOnLoad={true}>
      <UserProvider autoSignIn={true}>
        <PointsProvider>{children}</PointsProvider>
      </UserProvider>
    </MiniAppProvider>
  );
}
