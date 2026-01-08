"use client";

import { ColorComparison } from "./color-comparison";
import type { ColorPalette } from "@/lib/types";

interface ColorPaletteDisplayProps {
  palette: ColorPalette;
  onColorChange?: (background: string, accent: string) => void;
}

/**
 * Color Palette Display Component
 * 
 * Uses the M3 Two-Color Comparison approach:
 * - Harmonized: M3's Blend.harmonize() for cohesive feel
 * - Contrast Validated: WCAG AA 4.5:1 compliance check
 * 
 * Both approaches use the two most frequent colors from workspace images.
 */
export function ColorPaletteDisplay({
  palette,
  onColorChange,
}: ColorPaletteDisplayProps) {
  return <ColorComparison palette={palette} onColorChange={onColorChange} />;
}
