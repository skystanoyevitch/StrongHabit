export const getContrastTextColor = (backgroundColor: string): string => {
  // Handle invalid colors
  if (!backgroundColor || typeof backgroundColor !== "string") {
    return "#000000"; // Default to black as fallback
  }

  // Remove the # if present
  const hex = backgroundColor.replace("#", "");

  // Handle invalid hex codes
  if (!/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return "#000000"; // Default to black for invalid hex
  }

  // Convert 3-character hex to 6-character
  const fullHex =
    hex.length === 3
      ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      : hex;

  // Convert hex to RGB
  const r = parseInt(fullHex.substr(0, 2), 16) / 255;
  const g = parseInt(fullHex.substr(2, 2), 16) / 255;
  const b = parseInt(fullHex.substr(4, 2), 16) / 255;

  // Calculate relative luminance using WCAG formula
  // For sRGB colorspace
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  // Calculate contrast ratio with white (1.0) and black (0.0)
  // Using WCAG contrast ratio formula: (L1 + 0.05) / (L2 + 0.05)
  const contrastWithWhite = (1.0 + 0.05) / (L + 0.05);
  const contrastWithBlack = (L + 0.05) / (0.0 + 0.05);

  // Return the color with better contrast
  // WCAG AA requires a contrast ratio of at least 4.5:1 for normal text
  return contrastWithWhite >= contrastWithBlack ? "#FFFFFF" : "#000000";
};
