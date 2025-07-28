// TimeAgo.tsx
import { useEffect, useState } from "react";

/**
 * Calculates the relative time string (e.g., "2 minutes ago").
 * @param date The date to calculate the time ago from.
 * @returns A formatted string representing the relative time.
 */
function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000); // Seconds in a year
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000); // Seconds in a month
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400); // Seconds in a day
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600); // Seconds in an hour
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60); // Seconds in a minute
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return "Just now";
}

interface TimeAgoProps {
  /**
   * The date string to calculate the time ago from.
   * Expected format: ISO 8601 (e.g., "2023-10-27T10:00:00Z")
   */
  date?: string;
  /**
   * Whether to append " (edited)" to the time string.
   */
  edited?: boolean;
}

/**
 * A component to display relative time (e.g., "2 minutes ago").
 * Renders an inline <span> to avoid HTML validation errors.
 *
 * @param props The component props.
 * @returns A React element displaying the relative time.
 */
export function TimeAgo({ date, edited = false }: TimeAgoProps) {
  const [timeString, setTimeString] = useState<string>("Just now");

  useEffect(() => {
    // Handle missing or invalid date
    if (!date) {
      setTimeString("Just now");
      return;
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      // Invalid date string
      setTimeString("Just now");
      return;
    }

    // Function to update the time string
    const updateTimeString = () => {
      setTimeString(timeAgo(parsedDate));
    };

    // Set the initial time string
    updateTimeString();

    // Set up an interval to update the time string every second
    const intervalId = setInterval(updateTimeString, 1000);

    // Cleanup function to clear the interval
    return () => {
      clearInterval(intervalId);
    };
  }, [date]); // Re-run effect if the date prop changes

  // ✅ Fix: Render an inline <span> element to prevent hydration errors
  // when used inside <p> tags (e.g., within Chakra UI's <Text> component)
  return (
    <span className="text-sm">
      {timeString}
      {edited && " (edited)"}
    </span>
  );
}