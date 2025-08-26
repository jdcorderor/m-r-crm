// Format date to a readable string
export function formatDate(isoDate: string, timeZone: string = 'America/Caracas'): string {
  if (!isoDate.includes("T")) {
    return `${isoDate.split("-")[2]}/${isoDate.split("-")[1]}/${isoDate.split("-")[0]}`
  }
  
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  };

  const formatter = new Intl.DateTimeFormat('es-VE', options);
  const parts = formatter.formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';

  return `${get('day')}/${get('month')}/${get('year')}, ${get('hour')}:${get('minute')}`;
}