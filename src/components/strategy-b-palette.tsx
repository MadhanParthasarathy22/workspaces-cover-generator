"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColorPalette } from "@/lib/types";
import {
  initStrategyB,
  getCurrentPairB,
  regenerateB,
  isCurrentPairDark,
  type StrategyBState,
} from "@/lib/strategies/strategy-b";

interface StrategyBPaletteProps {
  palette: ColorPalette;
  onColorChange?: (background: string, accent: string) => void;
}

/**
 * Strategy B: Single Smart Button
 * Alternates between Dark and Light mode: Dark → Light → Dark → Light
 */
export function StrategyBPalette({
  palette,
  onColorChange,
}: StrategyBPaletteProps) {
  const [state, setState] = useState<StrategyBState | null>(null);

  // Initialize state when palette changes
  useEffect(() => {
    if (palette.colorGroups && palette.colorGroups.length > 0) {
      const initialState = initStrategyB(palette.colorGroups);
      setState(initialState);
      
      // Notify parent of initial selection
      const pair = getCurrentPairB(initialState);
      onColorChange?.(pair.background, pair.accent);
    }
  }, [palette]);

  if (!state || state.allPairs.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <p className="text-zinc-500 text-center">No color pairs available</p>
        </CardContent>
      </Card>
    );
  }

  const currentPair = getCurrentPairB(state);
  const isDarkMode = isCurrentPairDark(state);

  function handleRegenerate() {
    if (!state) return;
    
    const newState = regenerateB(state);
    setState(newState);
    
    const pair = getCurrentPairB(newState);
    onColorChange?.(pair.background, pair.accent);
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <span>Color Palette</span>
          <span className="text-sm font-normal text-zinc-500">
            {state.currentIndex + 1} / {state.totalPairs}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Indicator */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isDarkMode 
              ? "bg-zinc-800 text-zinc-300" 
              : "bg-amber-900/50 text-amber-300"
          }`}>
            {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </span>
          <span className="text-xs text-zinc-500">
            (alternating)
          </span>
        </div>

        {/* Color Preview */}
        <div
          className="rounded-lg p-6 transition-colors duration-300"
          style={{ backgroundColor: currentPair.background }}
        >
          <div className="space-y-3">
            <h3
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: currentPair.accent }}
            >
              Workspaces
            </h3>
            <p
              className="text-sm opacity-80 transition-colors duration-300"
              style={{ color: currentPair.accent }}
            >
              Preview of your book cover colors
            </p>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-zinc-500 mb-1">Background</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-zinc-700"
                style={{ backgroundColor: currentPair.background }}
              />
              <code className="text-xs text-zinc-400 uppercase">
                {currentPair.background}
              </code>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-500 mb-1">Accent</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-zinc-700"
                style={{ backgroundColor: currentPair.accent }}
              />
              <code className="text-xs text-zinc-400 uppercase">
                {currentPair.accent}
              </code>
            </div>
          </div>
        </div>

        {/* All Extracted Color Groups */}
        {palette.colorGroups && palette.colorGroups.length > 0 && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Extracted Colors (by frequency)
            </p>
            <div className="flex flex-wrap gap-2">
              {palette.colorGroups.slice(0, 8).map((group, index) => (
                <div
                  key={index}
                  className="group relative"
                  title={`${group.category} - appears in ${group.frequency} image(s)`}
                >
                  <div
                    className="w-8 h-8 rounded border border-zinc-700"
                    style={{ backgroundColor: group.representative }}
                  />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {group.frequency}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regenerate Button */}
        <Button
          onClick={handleRegenerate}
          variant="outline"
          className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          disabled={state.totalPairs <= 1}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Regenerate Colors
        </Button>

        {/* Strategy Label */}
        <p className="text-xs text-zinc-600 text-center">
          Alternates: Dark → Light → Dark → Light
        </p>
      </CardContent>
    </Card>
  );
}

