/** "$29.99" or "Item total: $29.99" -> 29.99 */
export function parsePrice(text: string): number {
  const match = text.match(/\$(-?\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[1]);
}

/** Work in whole cents to avoid floating-point errors in expected values. */
export const toCents = (amount: number) => Math.round(amount * 100);
