import type { ColorGroup, ColorPalette, ColorPair } from "./types";

/**
 * Color utility functions for frequency-based color extraction
 * This file is client-safe (no node dependencies)
 */

// ============================================
// Color Conversion Functions
// ============================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Get lightness value (0-100) from a hex color
 */
export function getLightness(hex: string): number {
  return hexToHsl(hex).l;
}

/**
 * Check if a color is "dark" (lightness < 45)
 */
export function isDark(hex: string): boolean {
  return getLightness(hex) < 45;
}

/**
 * Check if a color is "light" (lightness > 55)
 */
export function isLight(hex: string): boolean {
  return getLightness(hex) > 55;
}

/**
 * Get saturation value (0-100) from a hex color
 */
export function getSaturation(hex: string): number {
  return hexToHsl(hex).s;
}

/**
 * Check if a color is "neutral" (gray, white, off-white)
 * These are common wall colors we want to deprioritize
 * - Very low saturation (< 12%) = gray
 * - High lightness (> 85%) with low saturation = white/off-white
 */
export function isNeutralColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  
  // Pure gray: very low saturation
  if (hsl.s < 12) return true;
  
  // Near-white: high lightness with low-medium saturation
  if (hsl.l > 85 && hsl.s < 25) return true;
  
  // Near-black with no color: very dark and desaturated
  if (hsl.l < 10 && hsl.s < 20) return true;
  
  return false;
}

/**
 * Check if a color is "interesting" (has enough saturation to be distinctive)
 * Used to prioritize colorful tones over neutrals
 */
export function isInterestingColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  
  // Must have some saturation to be interesting
  if (hsl.s < 15) return false;
  
  // Avoid pure white and pure black
  if (hsl.l > 92 || hsl.l < 8) return false;
  
  return true;
}

/**
 * Calculate a "vibrancy score" for a color
 * Higher score = more Material You / pastel-like qualities
 * Prefers medium-high saturation and avoids extreme lightness
 */
export function getVibrancyScore(hex: string): number {
  const hsl = hexToHsl(hex);
  
  // Penalize very low saturation (grays)
  if (hsl.s < 15) return 0;
  
  // Saturation score: prefer 30-70% (pastel to vibrant range)
  let satScore = hsl.s;
  if (hsl.s > 70) satScore = 70 + (hsl.s - 70) * 0.5; // Slightly reduce very saturated
  
  // Lightness score: prefer 25-75% (avoid pure black/white)
  let lightScore = 100;
  if (hsl.l < 20) lightScore = hsl.l * 5;
  else if (hsl.l > 80) lightScore = (100 - hsl.l) * 5;
  
  return (satScore * 0.7 + lightScore * 0.3);
}

// ============================================
// Color Distance and Similarity
// ============================================

/**
 * Calculate Euclidean distance between two colors in RGB space
 * Returns 0 for identical colors, up to ~441 for max different (black vs white)
 */
export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Check if two colors are similar (within threshold)
 * Default threshold of 50 works well for grouping similar shades
 */
export function areSimilarColors(hex1: string, hex2: string, threshold = 50): boolean {
  return colorDistance(hex1, hex2) < threshold;
}

// ============================================
// Color Grouping for Frequency Analysis
// ============================================

/**
 * Determine the category of a color based on its HSL values
 */
export function getColorCategory(hex: string): ColorGroup["category"] {
  const hsl = hexToHsl(hex);

  if (hsl.l < 35) return "dark";
  if (hsl.l > 65) return "light";
  if (hsl.s > 50) return "vibrant";
  return "muted";
}

/**
 * Group similar colors together and count their frequency
 * Each color from an image counts once per image (not by pixel count)
 * Filters out neutral colors (grays/whites) and prioritizes vibrant/pastel tones
 */
export function groupColorsByFrequency(
  colorsPerImage: string[][]
): ColorGroup[] {
  const groups: ColorGroup[] = [];

  // Flatten all colors and track which images they came from
  const colorImageMap = new Map<string, Set<number>>();

  colorsPerImage.forEach((colors, imageIndex) => {
    colors.forEach((color) => {
      // Skip neutral colors (grays, whites, off-whites) - common wall colors
      if (isNeutralColor(color)) {
        return;
      }

      // Find if this color belongs to an existing group
      let foundGroup = false;
      for (const group of groups) {
        if (areSimilarColors(color, group.representative)) {
          group.variants.push(color);
          // Track image index for frequency
          const imageSet = colorImageMap.get(group.representative) || new Set();
          imageSet.add(imageIndex);
          colorImageMap.set(group.representative, imageSet);
          foundGroup = true;
          break;
        }
      }

      // Create new group if no similar color found
      if (!foundGroup) {
        groups.push({
          representative: color,
          variants: [color],
          frequency: 0, // Will be calculated after
          lightness: getLightness(color),
          category: getColorCategory(color),
        });
        colorImageMap.set(color, new Set([imageIndex]));
      }
    });
  });

  // Calculate frequency based on how many unique images each group appears in
  for (const group of groups) {
    const imageSet = colorImageMap.get(group.representative);
    group.frequency = imageSet ? imageSet.size : 1;
  }

  // Sort by: frequency first, then vibrancy score (prefer interesting colors)
  groups.sort((a, b) => {
    // Primary: frequency (most common first)
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    
    // Secondary: vibrancy score (prefer more colorful/pastel tones)
    const vibrancyA = getVibrancyScore(a.representative);
    const vibrancyB = getVibrancyScore(b.representative);
    if (vibrancyB !== vibrancyA) {
      return vibrancyB - vibrancyA;
    }
    
    // Tertiary: prefer darker colors for dark mode aesthetics
    return a.lightness - b.lightness;
  });

  return groups;
}

// ============================================
// Mode Detection
// ============================================

/**
 * Detect whether the workspace is predominantly dark or light
 * Based on weighted average lightness of top frequent colors
 */
export function detectWorkspaceMode(colorGroups: ColorGroup[]): "light" | "dark" {
  if (colorGroups.length === 0) return "dark";

  // Take top 3 most frequent colors
  const topColors = colorGroups.slice(0, 3);
  const totalFrequency = topColors.reduce((sum, c) => sum + c.frequency, 0);

  if (totalFrequency === 0) return "dark";

  // Weighted average lightness
  const weightedLightness = topColors.reduce(
    (sum, c) => sum + c.lightness * c.frequency,
    0
  ) / totalFrequency;

  // Threshold at 45% - below is dark, above is light
  return weightedLightness < 45 ? "dark" : "light";
}

// ============================================
// Color Pair Generation (for both strategies)
// ============================================

/**
 * Generate color pairs for dark mode (dark bg + light/vibrant accent)
 * Prioritizes interesting, non-neutral colors
 */
export function generateDarkModePairs(colorGroups: ColorGroup[]): ColorPair[] {
  // Filter to only interesting colors (not neutral grays)
  const interestingGroups = colorGroups.filter(c => isInterestingColor(c.representative));
  
  // Fall back to all groups if too few interesting colors
  const groupsToUse = interestingGroups.length >= 2 ? interestingGroups : colorGroups;
  
  const darkColors = groupsToUse.filter((c) => c.category === "dark" || c.category === "muted");
  const lightColors = groupsToUse.filter((c) => c.category === "light" || c.category === "vibrant");

  const pairs: ColorPair[] = [];

  // Prioritize by frequency and vibrancy
  for (const bg of darkColors) {
    for (const accent of lightColors) {
      if (bg.representative !== accent.representative) {
        pairs.push({
          background: bg.representative,
          accent: accent.representative,
        });
      }
    }
  }

  // If not enough pairs, also try dark + dark (for contrast)
  if (pairs.length < 3) {
    for (const bg of darkColors) {
      for (const accent of darkColors) {
        if (bg.representative !== accent.representative && bg.lightness < accent.lightness) {
          pairs.push({
            background: bg.representative,
            accent: accent.representative,
          });
        }
      }
    }
  }

  return pairs.slice(0, 6);
}

/**
 * Generate color pairs for light mode (light bg + dark accent)
 * For light mode, we allow pastel/light backgrounds but ensure colorful accents
 */
export function generateLightModePairs(colorGroups: ColorGroup[]): ColorPair[] {
  // Filter to only interesting colors for accents
  const interestingGroups = colorGroups.filter(c => isInterestingColor(c.representative));
  
  // Fall back to all groups if too few interesting colors
  const groupsToUse = interestingGroups.length >= 2 ? interestingGroups : colorGroups;
  
  const darkColors = groupsToUse.filter((c) => c.category === "dark" || c.category === "muted");
  const lightColors = groupsToUse.filter((c) => c.category === "light" || c.category === "vibrant");

  const pairs: ColorPair[] = [];

  // Light background + dark accent
  for (const bg of lightColors) {
    for (const accent of darkColors) {
      if (bg.representative !== accent.representative) {
        pairs.push({
          background: bg.representative,
          accent: accent.representative,
        });
      }
    }
  }

  return pairs.slice(0, 6);
}

/**
 * Generate all color pairs (for Strategy B - cycles through all)
 * Interleaves dark and light mode pairs: Dark → Light → Dark → Light
 */
export function generateAllColorPairs(colorGroups: ColorGroup[]): ColorPair[] {
  const darkPairs = generateDarkModePairs(colorGroups);
  const lightPairs = generateLightModePairs(colorGroups);

  // Interleave dark and light pairs
  const interleaved: ColorPair[] = [];
  const maxLength = Math.max(darkPairs.length, lightPairs.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (i < darkPairs.length) {
      interleaved.push(darkPairs[i]);
    }
    if (i < lightPairs.length) {
      interleaved.push(lightPairs[i]);
    }
  }

  return interleaved.slice(0, 12);
}

// ============================================
// Legacy function for backward compatibility
// ============================================

/**
 * Generate alternative color combinations from the palette
 * Updated to work with ColorGroups
 */
export function generateColorCombinations(
  palette: ColorPalette
): ColorPair[] {
  if (palette.colorGroups && palette.colorGroups.length > 0) {
    return generateAllColorPairs(palette.colorGroups);
  }

  // Fallback to old behavior for backward compatibility
  const combinations: ColorPair[] = [];
  const swatches = palette.allSwatches;

  combinations.push({
    background: palette.background,
    accent: palette.accent,
  });

  const darkSwatches = swatches.filter(
    (s) => s.name.includes("Dark") || s.name === "Muted"
  );
  const lightSwatches = swatches.filter(
    (s) => s.name.includes("Light") || s.name === "Vibrant"
  );

  for (const dark of darkSwatches) {
    for (const light of lightSwatches) {
      if (dark.hex !== light.hex) {
        const combo = { background: dark.hex, accent: light.hex };
        if (!combinations.some((c) => c.background === combo.background && c.accent === combo.accent)) {
          combinations.push(combo);
        }
      }
    }
  }

  return combinations.slice(0, 8);
}
