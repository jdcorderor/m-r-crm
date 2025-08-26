// Format date to a readable string
export function formatDate(time: string): string {
  const isoTime = new Date(time).toISOString();
  const date = new Date(isoTime);
  return date.toLocaleString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}