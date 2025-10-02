"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Button, Text, Flex, Paper } from "@mantine/core";
import { useState } from "react";
import { Share2, Link, Check, Copy, CircleCheck } from "lucide-react";
import { generateReferralURL } from "@/lib/storage";
import { usePoints } from "@/contexts/points-context";

interface ShareButtonProps {
  referralCode: string;
}

export default function ShareButton({ referralCode }: ShareButtonProps) {
  const { userPoints } = usePoints();
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCastClick = async () => {
    setIsSharing(true);

    await sdk.actions.composeCast({
      text: "beamr",
      embeds: [process.env.NEXT_PUBLIC_URL || ""],
    });

    setIsSharing(false);
  };

  const handleNativeCopy = async () => {
    const referralURL = generateReferralURL(referralCode);

    if (navigator.share) {
      try {
        await navigator.share({
          url: referralURL,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
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
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      // Final fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await handleNativeCopy();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="md">
      <Button
        onClick={handleCastClick}
        loading={isSharing}
        variant="outline"
        color="white"
        leftSection={
          <Flex align="center" gap="xs">
            <Share2 size={16} />
            {userPoints?.socialStatus?.hasReferred && (
              <CircleCheck size={16} color="green" />
            )}
          </Flex>
        }
        size="lg"
      >
        Share
      </Button>

      <Button
        onClick={handleShare}
        variant="transparent"
        color="white"
        leftSection={<Copy size={16} />}
        size="xs"
        styles={{
          root: {
            transition: "all 0.3s ease",
            transform: copied ? "scale(1.05)" : "scale(1)",
            minWidth: "200px",
          },
        }}
      >
        {copied ? "Copied to clipboard" : "Copy Referral Link"}
      </Button>
    </Flex>
  );
}
