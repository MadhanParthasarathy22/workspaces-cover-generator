"use client";

import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { WorkspaceDisplay } from "@/components/workspace-display";
import { ColorPaletteDisplay } from "@/components/color-palette";
import { scrapeWorkspaceUrl } from "@/app/actions/scrape";
import { extractColors } from "@/app/actions/colors";
import type { WorkspaceData, ColorPalette } from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [selectedColors, setSelectedColors] = useState<{
    background: string;
    accent: string;
  } | null>(null);

  async function handleScrape(url: string) {
    setIsLoading(true);
    setError(null);
    setColorPalette(null);
    setSelectedColors(null);

    const result = await scrapeWorkspaceUrl(url);

    if (result.success && result.data) {
      setWorkspaceData(result.data);

      // Auto-extract colors from ALL images using frequency-based analysis
      if (result.data.images.length > 0) {
        setIsExtractingColors(true);
        // Pass all images to extract colors with frequency analysis
        const colorResult = await extractColors(result.data.images);
        if (colorResult.success && colorResult.palette) {
          setColorPalette(colorResult.palette);
          setSelectedColors({
            background: colorResult.palette.background,
            accent: colorResult.palette.accent,
          });
        }
        setIsExtractingColors(false);
      }
    } else {
      setError(result.error || "Failed to scrape workspace");
      setWorkspaceData(null);
    }

    setIsLoading(false);
  }

  function handleColorChange(background: string, accent: string) {
    setSelectedColors({ background, accent });
  }

  return (
    <main className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Workspaces Cover Generator
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Paste a Workspaces.xyz profile URL to scrape workspace data and
            extract a color palette from the images.
          </p>
        </div>

        {/* URL Input */}
        <div className="flex justify-center">
          <UrlInput onSubmit={handleScrape} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-2xl p-4 bg-red-950/50 border border-red-900 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-zinc-400">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Scraping workspace data...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {workspaceData && !isLoading && (
          <div className="space-y-8">
            {/* Workspace Data */}
            <WorkspaceDisplay data={workspaceData} />

            {/* Color Comparison Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Color Palette Comparison
              </h2>
              <p className="text-sm text-zinc-500">
                Compare two color selection approaches. Regenerate to cycle through different pairs.
              </p>
              
              {isExtractingColors ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center justify-center gap-3 text-zinc-400">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Extracting colors from workspace images...</span>
                  </div>
                </div>
              ) : colorPalette ? (
                <ColorPaletteDisplay
                  palette={colorPalette}
                  onColorChange={handleColorChange}
                />
              ) : workspaceData.images.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <p className="text-zinc-500 text-center">
                    No images found to extract colors from
                  </p>
                </div>
              ) : null}

              {/* Selected Colors Preview */}
              {selectedColors && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-2">Currently Active Colors</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded border border-zinc-700"
                        style={{ backgroundColor: selectedColors.background }}
                      />
                      <div className="text-xs">
                        <p className="text-zinc-500">Background</p>
                        <code className="text-zinc-400 uppercase">{selectedColors.background}</code>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded border border-zinc-700"
                        style={{ backgroundColor: selectedColors.accent }}
                      />
                      <div className="text-xs">
                        <p className="text-zinc-500">Accent</p>
                        <code className="text-zinc-400 uppercase">{selectedColors.accent}</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!workspaceData && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-zinc-600">
              Enter a Workspaces.xyz URL above to get started
            </p>
            <p className="text-zinc-700 text-sm mt-2">
              Example: https://www.workspaces.xyz/p/440-dinesh-dave
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
