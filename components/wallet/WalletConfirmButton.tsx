"use client";

import { Button, Text, Flex } from "@mantine/core";
import { Wallet } from "lucide-react";
import { useState } from "react";

interface WalletConfirmButtonProps {
  onConfirm: (walletAddress: string) => Promise<void>;
  selectedWallet: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function WalletConfirmButton({
  onConfirm,
  selectedWallet,
  disabled = false,
  isLoading = false,
}: WalletConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedWallet) return;

    setIsConfirming(true);
    try {
      await onConfirm(selectedWallet);
    } catch (error) {
      console.error("Failed to confirm wallet:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const isDisabled = disabled || !selectedWallet || isLoading || isConfirming;

  return (
    <Flex direction="column" align="center" gap="sm">
      <Button
        onClick={handleConfirm}
        disabled={isDisabled}
        loading={isConfirming || isLoading}
        size="md"
        variant="outline"
        color="white"
        style={{
          minWidth: "200px",
        }}
      >
        {isConfirming ? "Saving..." : "Save"}
      </Button>
    </Flex>
  );
}
