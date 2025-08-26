// Format date to a readable string
import { DateTime } from 'luxon';

export function formatDate(input: string): string {
  const zone = 'America/Caracas';

  // Detecta si es solo fecha (sin hora)
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(input);

  const date = isDateOnly
    ? DateTime.fromObject(
        {
          year: +input.slice(0, 4),
          month: +input.slice(5, 7),
          day: +input.slice(8, 10),
        },
        { zone }
      )
    : DateTime.fromISO(input, { zone: 'utc' }).setZone(zone);

  return date.toFormat(isDateOnly ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm');
}