"use client";

import { useState, useCallback } from "react";
import { Button } from "@mantine/core";
import { RotateCcw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function RefreshButton({
  onRefresh,
  disabled = false,
  size = "xs",
}: RefreshButtonProps) {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleRefresh = useCallback(() => {
    if (isCooldown || disabled) return;

    onRefresh();
    setIsCooldown(true);

    const interval = setInterval(() => {
      clearInterval(interval);
      setIsCooldown(false);
    }, 10000);
  }, [onRefresh, isCooldown, disabled]);

  const isDisabled = disabled || isCooldown;

  return (
    <Button
      variant="transparent"
      size={size}
      disabled={isDisabled}
      onClick={handleRefresh}
    >
      <RotateCcw size={size === "xs" ? 12 : 16} />
    </Button>
  );
}

