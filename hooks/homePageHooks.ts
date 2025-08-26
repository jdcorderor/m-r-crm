// Format date to a readable string
export function formatDate(input: string): string {
  // Detecta si es una fecha con hora vacía (T00:00:00.000Z)
  if (/T00:00:00(\.000)?Z$/.test(input)) {
    const [datePart] = input.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  // Asume formato ISO válido con hora
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return input; // fallback si no coincide

  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year}, ${Number(hour) - 4}:${minute}`;
}
