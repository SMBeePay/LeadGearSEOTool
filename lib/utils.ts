// Simple className utility function
export function cn(...inputs: (string | undefined | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

export function getPercentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}