/**
 * Formats a Date object into a readable string format in Spanish
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('es-ES', options);
}

/**
 * Checks if a string contains a date (used for search functionality)
 */
export function dateContainsString(date: Date, searchString: string): boolean {
  if (!searchString) return false;

  const dateStr = formatDate(date).toLowerCase();
  const monthName = date.toLocaleDateString('es-ES', { month: 'long' }).toLowerCase();
  const monthShort = date.toLocaleDateString('es-ES', { month: 'short' }).toLowerCase();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();

  const searchLower = searchString.toLowerCase();

  return (
    dateStr.includes(searchLower) ||
    monthName.includes(searchLower) ||
    monthShort.includes(searchLower) ||
    year.includes(searchLower) ||
    month.includes(searchLower) ||
    day.includes(searchLower)
  );
}
