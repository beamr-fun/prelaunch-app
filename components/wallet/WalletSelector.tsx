"use client";

import { Select, Text } from "@mantine/core";
import { useState } from "react";

interface WalletSelectorProps {
  wallets: string[];
  selectedWallet: string;
  currentWallet?: string;
  primaryWallet: string;
  onWalletSelect: (wallet: string) => void;
  disabled?: boolean;
}

export default function WalletSelector({
  wallets,
  selectedWallet,
  primaryWallet,
  currentWallet,
  onWalletSelect,
  disabled = false,
}: WalletSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const validateWallet = (wallet: string): boolean => {
    // Basic wallet address validation
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(wallet);
    if (!isValid) {
      setError("Invalid wallet address format");
      return false;
    }
    setError(null);
    return true;
  };

  const handleWalletChange = (value: string | null) => {
    if (value && validateWallet(value)) {
      onWalletSelect(value);
    }
  };

  const truncateWallet = (wallet: string) => {
    const truncAddy = `${wallet.substring(0, 6)}...${wallet.substring(
      wallet.length - 4
    )}`;

    if (wallet === primaryWallet && wallet === currentWallet)
      return `${truncAddy} (primary, connected)`;
    if (wallet === primaryWallet) return `${truncAddy} (primary)`;
    if (wallet === currentWallet) return `${truncAddy} (connected)`;
    return truncAddy;
  };

  const walletOptions = wallets.map((wallet) => ({
    value: wallet,
    label: truncateWallet(wallet),
  }));

  return (
    <div>
      <Select
        label="All future Beamr streams will be concentrated in this wallet:"
        placeholder="Choose a wallet address"
        data={walletOptions}
        value={selectedWallet}
        onChange={handleWalletChange}
        disabled={disabled}
        error={error}
        size="lg"
        style={{ width: "100%" }}
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
      />
      {error && (
        <Text size="sm" c="red" mt="xs">
          {error}
        </Text>
      )}
    </div>
  );
}
