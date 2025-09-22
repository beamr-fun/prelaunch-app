"use client";

import { Button, Text, Flex, Paper } from "@mantine/core";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ReferralCodeProps {
  referralCode: string;
  onCopy?: () => void;
}

export default function ReferralCode({
  referralCode,
  onCopy,
}: ReferralCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      onCopy?.();

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy referral code:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: "var(--mantine-color-dark-6)",
        border: "1px solid var(--mantine-color-gray-4)",
        width: "100%",
        maxWidth: "300px",
      }}
    >
      <Flex direction="column" align="center" gap="md">
        <Text size="sm" c="gray.4" ta="center">
          Your Referral Code
        </Text>

        <Text
          size="lg"
          fw={700}
          c="white"
          style={{
            fontFamily: "monospace",
            letterSpacing: "1px",
            backgroundColor: "var(--mantine-color-dark-7)",
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid var(--mantine-color-gray-5)",
          }}
        >
          {referralCode}
        </Text>

        <Button
          onClick={handleCopy}
          variant={copied ? "filled" : "outline"}
          color={copied ? "green" : "blue"}
          leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
          size="sm"
          style={{
            transition: "all 0.3s ease",
            transform: copied ? "scale(1.05)" : "scale(1)",
          }}
        >
          {copied ? "Copied!" : "Copy Code"}
        </Button>

        {copied && (
          <Text size="xs" c="green" ta="center">
            Referral code copied to clipboard!
          </Text>
        )}
      </Flex>
    </Paper>
  );
}
