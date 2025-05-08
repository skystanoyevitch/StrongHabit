/**
 * Converts HEX color to RGB object
 * With improved error handling for invalid inputs
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Default fallback color (medium gray) in case of invalid input
  const defaultRgb = { r: 128, g: 128, b: 128 };

  // Check if hex is undefined, null, or not a string
  if (!hex || typeof hex !== "string") {
    return defaultRgb;
  }

  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Handle invalid hex strings
  if (!/^([0-9A-F]{3}){1,2}$/i.test(hex)) {
    // Return default if invalid format
    return defaultRgb;
  }

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

/**
 * Converts RGB to HEX color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Calculates luminance of a color (used for determining text color)
 */
export const getLuminance = (hexColor: string): number => {
  const rgb = hexToRgb(hexColor);

  // Convert RGB to linear values
  const rLinear = rgb.r / 255;
  const gLinear = rgb.g / 255;
  const bLinear = rgb.b / 255;

  // Apply gamma correction
  const r =
    rLinear <= 0.03928
      ? rLinear / 12.92
      : Math.pow((rLinear + 0.055) / 1.055, 2.4);
  const g =
    gLinear <= 0.03928
      ? gLinear / 12.92
      : Math.pow((gLinear + 0.055) / 1.055, 2.4);
  const b =
    bLinear <= 0.03928
      ? bLinear / 12.92
      : Math.pow((bLinear + 0.055) / 1.055, 2.4);

  // Calculate luminance according to WCAG formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculates contrast ratio between two colors (WCAG formula)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighterLum = Math.max(l1, l2);
  const darkerLum = Math.min(l1, l2);

  return (lighterLum + 0.05) / (darkerLum + 0.05);
};

/**
 * Creates an accessible color palette based on a single color
 */
export const generateAccessibleColorPalette = (baseColor: string) => {
  // Create light version (background)
  const light = lightenColor(baseColor, 0.85);

  // Create dark version for text on light backgrounds
  const dark = darkenColor(baseColor, 0.3);

  // Text color based on luminance
  const text = getLuminance(baseColor) > 0.5 ? "#212121" : "#FFFFFF";

  // Create an analogous accent color
  const rgbBase = hexToRgb(baseColor);
  // Shift hue slightly
  let analogousR = rgbBase.r - 20;
  let analogousG = rgbBase.g + 20;
  let analogousB = rgbBase.b - 10;

  // Clamp values
  analogousR = Math.max(0, Math.min(255, analogousR));
  analogousG = Math.max(0, Math.min(255, analogousG));
  analogousB = Math.max(0, Math.min(255, analogousB));

  const analogous = rgbToHex(analogousR, analogousG, analogousB);

  return {
    base: baseColor,
    light,
    dark,
    text,
    analogous,
  };
};

/**
 * Darkens a color by a percentage factor (negative values lighten)
 */
export const darkenColor = (color: string, factor: number): string => {
  const rgb = hexToRgb(color);

  // Darken each component
  const r = Math.max(0, Math.round(rgb.r * (1 - factor)));
  const g = Math.max(0, Math.round(rgb.g * (1 - factor)));
  const b = Math.max(0, Math.round(rgb.b * (1 - factor)));

  return rgbToHex(r, g, b);
};

/**
 * Lightens a color by a percentage factor
 * @param color - The color in hex format (e.g., '#RRGGBB')
 * @param factor - The factor (0-1) by which to lighten the color
 * @returns Lightened color in hex format
 */
export const lightenColor = (color: string, factor: number): string => {
  if (!color || !color.startsWith("#")) {
    return color || "#FFFFFF"; // Default to white if input is invalid
  }

  const rgb = hexToRgb(color);

  // Lighten each component
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));

  return rgbToHex(r, g, b);
};

/**
 * Returns an optimal text color (black or white) based on background
 * Ensures WCAG AA compliance (4.5:1 contrast ratio for normal text)
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  const white = "#FFFFFF";
  const black = "#212121"; // Using dark gray instead of pure black for softer contrast

  const contrastWithWhite = getContrastRatio(backgroundColor, white);
  const contrastWithBlack = getContrastRatio(backgroundColor, black);

  // Choose color with better contrast
  // WCAG AA requires at least 4.5:1 for normal text
  return contrastWithWhite >= contrastWithBlack ? white : black;
};
