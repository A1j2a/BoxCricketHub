import dayjs from 'dayjs';

// Format date to "Mon, Jan 1, 2023" format
export const formatDate = (dateString) => {
  return dayjs(dateString).format('ddd, MMM D, YYYY');
};

// Format time to "14:00" format
export const formatTime = (timeString) => {
  return timeString ? timeString.slice(0, 5) : ''; // HH:MM format
};

// Format time slot to "14:00 - 16:00" format
export const formatTimeSlot = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Calculate duration in hours between two time strings
export const calculateDuration = (startTime, endTime) => {
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  return end.diff(start, 'hour', true).toFixed(1);
};

// Check if a date is in the past
export const isDateInPast = (dateString) => {
  const date = dayjs(dateString);
  const today = dayjs().startOf('day');
  return date.isBefore(today);
};

// Check if a date is today
export const isToday = (dateString) => {
  const date = dayjs(dateString);
  const today = dayjs().startOf('day');
  return date.isSame(today, 'day');
};

// Generate an array of dates for the next N days
export const getNextNDays = (n = 7) => {
  const dates = [];
  for (let i = 0; i < n; i++) {
    const date = dayjs().add(i, 'day');
    dates.push({
      date: date.format('YYYY-MM-DD'),
      display: i === 0 ? 'Today' : date.format('ddd, MMM D')
    });
  }
  return dates;
};

// Check if two time ranges overlap
export const doTimesOverlap = (start1, end1, start2, end2) => {
  const s1 = dayjs(`2000-01-01 ${start1}`);
  const e1 = dayjs(`2000-01-01 ${end1}`);
  const s2 = dayjs(`2000-01-01 ${start2}`);
  const e2 = dayjs(`2000-01-01 ${end2}`);
  
  return (
    (s1.isAfter(s2) && s1.isBefore(e2)) ||
    (e1.isAfter(s2) && e1.isBefore(e2)) ||
    (s1.isSame(s2) || e1.isSame(e2)) ||
    (s1.isBefore(s2) && e1.isAfter(e2))
  );
};

// Format relative time (e.g., "2 days ago", "in 3 days")
export const formatRelativeTime = (dateString) => {
  const date = dayjs(dateString);
  const now = dayjs();
  const diffDays = date.diff(now, 'day');
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  } else {
    return `In ${diffDays} days`;
  }
};

// Get time slots for a day with specified interval (in minutes)
export const generateTimeSlots = (interval = 60) => {
  const slots = [];
  let time = dayjs().startOf('day').add(6, 'hour'); // Start at 6:00 AM
  const end = dayjs().startOf('day').add(23, 'hour'); // End at 11:00 PM
  
  while (time.isBefore(end)) {
    const startTime = time.format('HH:mm');
    time = time.add(interval, 'minute');
    const endTime = time.format('HH:mm');
    
    slots.push({
      startTime,
      endTime,
      display: `${startTime} - ${endTime}`
    });
  }
  
  return slots;
};
