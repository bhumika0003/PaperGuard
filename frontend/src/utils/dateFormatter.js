/**
 * Formats a timestamp in WhatsApp style:
 * - Today (same day): "08:43 pm" (or "Just now" if < 1 minute ago)
 * - 1 day ago (yesterday): "1 day ago · 08:43 pm"
 * - N days ago: "N days ago · 08:43 pm"
 * - Older (>30 days): "15 Sep 2026 · 08:43 pm"
 */
export const formatMessageTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();

  // Format 12-hour time, e.g., "08:43 pm"
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Difference in calendar days
  const diffInMs = startOfNow.getTime() - startOfMsg.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) {
    const secondsAgo = Math.floor((now - date) / 1000);
    if (secondsAgo < 60) {
      return `Just now · ${timeStr}`;
    }
    return timeStr;
  } else if (diffInDays === 1) {
    return `1 day ago · ${timeStr}`;
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago · ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${dateStr} · ${timeStr}`;
  }
};
