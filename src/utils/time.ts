interface TimeFromNowParams {
  timestamp: number;
}

export const getTimeFromNow = ({ timestamp }: TimeFromNowParams): string => {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = now - timestamp;
  if (diff > day) {
    return formatDate({ timestamp });
  } else {
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days}d ago`;
    }
  }
};

interface FormatDateParams {
  timestamp: number;
}

export const formatDate = ({ timestamp }: FormatDateParams): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
};
