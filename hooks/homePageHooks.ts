// Format date to a readable string
export function formatDate(time: string): string {
  const date = new Date(time);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}