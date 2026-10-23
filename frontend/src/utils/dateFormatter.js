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

/**
 * Formats a time string (e.g., "08:55:57" or "20:55:57") into 12-hour AM/PM format (e.g., "08:55:57 AM" or "08:55:57 PM").
 * If the string already contains AM/PM, it returns it as is.
 */
export const formatTimeWithAMPM = (timeStr) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    if (isNaN(hours)) return trimmed;
    const minutes = parts[1];
    const seconds = parts[2] ? `:${parts[2]}` : '';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes}${seconds} ${ampm}`;
  }
  return trimmed;
};
