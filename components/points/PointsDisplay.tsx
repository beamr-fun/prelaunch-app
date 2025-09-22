"use client";

import { Text, Badge, Flex } from "@mantine/core";
import { useState, useEffect } from "react";

interface PointsDisplayProps {
  points: number;
  label?: string;
  size?: "small" | "large";
}

export default function PointsDisplay({
  points,
  label,
  size = "small",
}: PointsDisplayProps) {
  const [displayPoints, setDisplayPoints] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayPoints !== points) {
      setIsAnimating(true);

      const increment = Math.ceil((points - displayPoints) / 20);
      const timer = setInterval(() => {
        setDisplayPoints((prev) => {
          const next = prev + increment;
          if (next >= points) {
            setDisplayPoints(points);
            setIsAnimating(false);
            clearInterval(timer);
            return points;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [points, displayPoints]);

  const formatPoints = (value: number) => {
    return value.toLocaleString();
  };

  if (size === "large") {
    return (
      <Flex direction="column" align="center" gap="xs">
        <Text
          size="3rem"
          fw={700}
          c="white"
          style={{
            fontFamily: "monospace",
            transition: "all 0.3s ease",
            transform: isAnimating ? "scale(1.05)" : "scale(1)",
          }}
        >
          {formatPoints(displayPoints)}
        </Text>
        <Text size="lg" c="gray.4" fw={500}>
          {label}
        </Text>
      </Flex>
    );
  }

  return (
    <Badge
      size="lg"
      variant="gradient"
      gradient={{ from: "blue", to: "purple" }}
      style={{
        transition: "all 0.3s ease",
        transform: isAnimating ? "scale(1.1)" : "scale(1)",
      }}
    >
      {formatPoints(displayPoints)} {label}
    </Badge>
  );
}
