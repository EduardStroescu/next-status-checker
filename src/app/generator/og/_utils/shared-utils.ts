import { Font } from "satori";

/**
 * Generates a Google Fonts query string for the given fonts.
 *
 * Examples:
 * - Normal style:
 *   https://fonts.googleapis.com/css2?family=Inter:wght@400
 *
 * - Multiple weights:
 *   https://fonts.googleapis.com/css2?family=Inter:wght@400;700
 *
 * - Italic style:
 *   https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400
 *
 * - Italic + multiple weights:
 *   https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400;1,700
 *
 * - Normal + Italic:
 *   https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;1,400
 *
 * - All combinations:
 *   https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;1,400;0,700;1,700
 *
 * - Multiple fonts:
 *   https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400;1,700&family=Material+Icons
 *
 * @param fonts - The fonts to generate the query string for.
 * @param groupByWeight - Whether to group fonts by weight.
 * @returns A Google Fonts query string.
 */
export function generateFontConfig(
  fonts: Omit<Font, "data">[],
  groupByWeight = false
): string {
  const grouped = groupByWeight
    ? fonts.reduce<Record<string, Set<string>>>((acc, font) => {
        const key = encodeURIComponent(font.name);
        const style = font.style === "italic" ? 1 : 0;
        const weightStr = `${style},${font.weight}`;
        if (!acc[key]) acc[key] = new Set();
        acc[key].add(weightStr);
        return acc;
      }, {})
    : null;

  if (groupByWeight && grouped) {
    return Object.entries(grouped)
      .map(
        ([name, styles]) =>
          `${name}:ital,wght@${Array.from(styles).sort().join(";")}`
      )
      .join("&family=");
  }

  return fonts
    .map((font) => {
      const name = encodeURIComponent(font.name);
      const isItalic = font.style === "italic";
      return isItalic
        ? `${name}:ital,wght@1,${font.weight}`
        : `${name}:wght@${font.weight}`;
    })
    .join("&family=");
}
