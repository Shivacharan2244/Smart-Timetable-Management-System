/**
 * Converts a 24-hour time string (e.g. "09:00:00", "13:20", "14:15:00")
 * to 12-hour format with AM/PM (e.g. "09:00 AM", "01:20 PM", "02:15 PM").
 */
export function format12Hour(timeStr) {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  const parts = str.split(':');
  if (parts.length < 2) return str;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  if (isNaN(hours)) return str;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats a time range in 12-hour format.
 * Example: ("09:00", "10:00") -> "09:00 AM – 10:00 AM"
 */
export function format12HourRange(startTime, endTime) {
  if (!startTime && !endTime) return '';
  if (!endTime) return format12Hour(startTime);
  if (!startTime) return format12Hour(endTime);
  return `${format12Hour(startTime)} – ${format12Hour(endTime)}`;
}
