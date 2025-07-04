/**
 * Converts a string to title case
 * @param text - The text to convert
 * @returns The text in title case
 */
export function toTitleCase(text: string): string {
  if (!text) return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 