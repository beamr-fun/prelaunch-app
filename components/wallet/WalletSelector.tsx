"use client";

import { Select, Text } from "@mantine/core";
import { useState } from "react";

interface WalletSelectorProps {
  wallets: string[];
  selectedWallet: string;
  onWalletSelect: (wallet: string) => void;
  disabled?: boolean;
}

export default function WalletSelector({
  wallets,
  selectedWallet,
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
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
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
        size="md"
        style={{ width: "100%" }}
        styles={{
          input: {
            backgroundColor: "var(--mantine-color-dark-6)",
            border: "1px solid var(--mantine-color-gray-4)",
            color: "white",
          },
          label: {
            fontSize: "10px",
            color: "white",
            marginBottom: "8px",
          },
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
