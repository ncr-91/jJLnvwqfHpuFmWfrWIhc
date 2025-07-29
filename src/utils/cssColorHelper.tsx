/**
 * @param varName
 * @returns
 */
export const getCssVar = (varName: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

/**
 * @param hex
 * @param alpha
 * @returns
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return hex;
};