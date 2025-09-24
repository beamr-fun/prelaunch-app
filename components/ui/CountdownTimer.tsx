"use client";

import { useState, useEffect } from "react";
import { Flex, Text } from "@mantine/core";
import CountdownDisplay from "./CountdownDisplay";

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <Flex direction="column" align="center" gap="md">
        <Text size="xl" fw={700} c="green">
          🚀 LAUNCHED! 🚀
        </Text>
        <Text size="md" c="gray.4">
          Welcome to the future of Beamer!
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" gap="lg">
      <Flex gap="xl" wrap="wrap" justify="center">
        <CountdownDisplay value={timeLeft.days} label="d" />
        <CountdownDisplay value={timeLeft.hours} label="h" />
        <CountdownDisplay value={timeLeft.minutes} label="m" />
        <CountdownDisplay value={timeLeft.seconds} label="s" />
      </Flex>
    </Flex>
  );
}
