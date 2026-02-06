/**
 * Format a date string using Intl.DateTimeFormat.
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", options).format(date);
}
