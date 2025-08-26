// Format date to a readable string
import { DateTime } from 'luxon';

export function formatDate(input: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(input);
  const zone = 'America/Caracas';

  const date = isDateOnly
    ? DateTime.fromFormat(input, 'yyyy-MM-dd', { zone, setZone: true })
    : DateTime.fromISO(input, { zone: 'utc' }).setZone(zone);

  return date.toFormat(isDateOnly ? 'dd/MM/yyyy' : 'dd/MM/yyyy, HH:mm');
}