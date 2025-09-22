"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";
import { WalletProvider } from "@/contexts/wallet-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniAppProvider addMiniAppOnLoad={true}>
      <UserProvider autoSignIn={true}>
        <WalletProvider>{children}</WalletProvider>
      </UserProvider>
    </MiniAppProvider>
  );
}
