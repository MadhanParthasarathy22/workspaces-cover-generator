"use client";

import { COLOR_STRATEGY } from "@/lib/config";
import { StrategyBPalette } from "./strategy-b-palette";
import { StrategyCPalette } from "./strategy-c-palette";
import type { ColorPalette } from "@/lib/types";

interface ColorPaletteDisplayProps {
  palette: ColorPalette;
  onColorChange?: (background: string, accent: string) => void;
}

/**
 * Color Palette Display Component
 * Routes to the appropriate strategy based on the feature flag
 * 
 * Change COLOR_STRATEGY in lib/config.ts to test different strategies:
 * - "B": Single button cycles through all (dark → light)
 * - "C": Auto-detect mode with toggle override
 */
export function ColorPaletteDisplay({
  palette,
  onColorChange,
}: ColorPaletteDisplayProps) {
  if (COLOR_STRATEGY === "B") {
    return <StrategyBPalette palette={palette} onColorChange={onColorChange} />;
  }
  
  return <StrategyCPalette palette={palette} onColorChange={onColorChange} />;
}
