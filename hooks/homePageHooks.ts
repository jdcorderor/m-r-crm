// Format date to a readable string
import { DateTime } from 'luxon';

export function formatDate(time: string): string {
  return DateTime.fromISO(time, { zone: 'America/Caracas' })
    .toFormat('dd/MM/yyyy, HH:mm');
}