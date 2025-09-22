"use client";

import { Button, Text, Flex, Paper } from "@mantine/core";
import { useState } from "react";
import { Share2, Link, Check, Copy } from "lucide-react";
import { generateReferralURL } from "@/lib/storage";

interface ShareButtonProps {
  referralCode: string;
  onShare?: (platform?: string) => void;
}

export default function ShareButton({
  referralCode,
  onShare,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleNativeShare = async () => {
    const referralURL = generateReferralURL(referralCode);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Beamer!",
          text: "Check out Beamer - the future of decentralized communication!",
          url: referralURL,
        });
        setShared(true);
        onShare?.("native");
        setTimeout(() => setShared(false), 3000);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share failed:", error);
          // Fallback to copy
          handleCopyFallback();
        }
      }
    } else {
      // Fallback to copy
      handleCopyFallback();
    }
  };

  const handleCopyFallback = async () => {
    const referralURL = generateReferralURL(referralCode);

    try {
      await navigator.clipboard.writeText(referralURL);
      setShared(true);
      onShare?.("copy");
      setTimeout(() => setShared(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      // Final fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShared(true);
      onShare?.("copy");
      setTimeout(() => setShared(false), 3000);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await handleNativeShare();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="md">
      <Button
        onClick={handleShare}
        loading={isSharing}
        variant="outline"
        color="white"
        leftSection={<Share2 size={16} />}
        size="lg"
      >
        Share
      </Button>

      <Button
        onClick={handleShare}
        loading={isSharing}
        variant="transparent"
        color="white"
        leftSection={<Copy size={16} />}
        size="xs"
        style={{
          transition: "all 0.3s ease",
          transform: shared ? "scale(1.05)" : "scale(1)",
          minWidth: "200px",
        }}
      >
        {isSharing
          ? "Copying..."
          : shared
          ? "Copied to clipboard"
          : "Copy Referral Link"}
      </Button>
    </Flex>
  );
}
