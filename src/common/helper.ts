/**
 * Replaces newline characters and extra whitespaces with a single space
 * @param {string} input the string to be formatted
 * @returns {string} the formatted string
 */
export function formatMultilineString(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
