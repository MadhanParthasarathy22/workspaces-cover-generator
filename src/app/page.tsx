"use client";

import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { WorkspaceDisplay } from "@/components/workspace-display";
import { ColorPaletteDisplay } from "@/components/color-palette";
import { BookSpread } from "@/components/book-spread";
import { scrapeWorkspaceUrl } from "@/app/actions/scrape";
import { extractColors } from "@/app/actions/colors";
import { useWorkspace } from "@/contexts/workspace-context";
import type { WorkspaceData, ColorPalette } from "@/lib/types";

export default function Home() {
  const {
    workspaceData,
    colorPalette,
    selectedColors,
    setWorkspaceData,
    setColorPalette,
    setSelectedColors,
  } = useWorkspace();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScrape(url: string) {
    setIsLoading(true);
    setError(null);
    setColorPalette(null);
    setSelectedColors(null);

    const result = await scrapeWorkspaceUrl(url);

    if (result.success && result.data) {
      // Update shared context state with scraped data
      setWorkspaceData(result.data);

      // Auto-extract colors from ALL images using frequency-based analysis
      if (result.data.images.length > 0) {
        setIsExtractingColors(true);
        // Pass all images to extract colors with frequency analysis
        const colorResult = await extractColors(result.data.images);
        if (colorResult.success && colorResult.palette) {
          // Update shared context state with color palette
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
    <main data-component="home-page" className="min-h-screen bg-zinc-950 py-16 px-4 sm:py-20">
      <div data-component="home-page-container" className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div data-component="home-header" className="text-center space-y-5">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            Workspaces Cover Generator
          </h1>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Paste a Workspaces.xyz profile URL to scrape workspace data and
            extract a color palette from the images.
          </p>
        </div>

        {/* URL Input */}
        <div data-component="home-url-input-wrapper" className="flex justify-center">
          <UrlInput onSubmit={handleScrape} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div 
            data-component="home-error-message"
            className="mx-auto max-w-2xl p-5 bg-red-950/40 backdrop-blur-sm border border-red-900/50 rounded-xl shadow-lg shadow-red-950/20"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-300 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div data-component="home-loading-state" className="text-center py-16" role="status" aria-live="polite">
            <div className="inline-flex items-center gap-3 text-zinc-300">
              <svg
                className="animate-spin h-6 w-6 text-amber-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <span className="text-lg font-medium">Scraping workspace data...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {workspaceData && !isLoading && (
          <div data-component="home-results-section" className="space-y-12">
            {/* Workspace Data */}
            <WorkspaceDisplay data={workspaceData} />

            {/* Color Comparison Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Color Palette
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed">
                  Harmonized color pairs extracted from your workspace. Regenerate to cycle through different combinations.
                </p>
              </div>
              
              {isExtractingColors ? (
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-8 shadow-xl" role="status" aria-live="polite">
                  <div className="flex items-center justify-center gap-3 text-zinc-300">
                    <svg
                      className="animate-spin h-6 w-6 text-amber-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                    <span className="text-lg font-medium">Extracting colors from workspace images...</span>
                  </div>
                </div>
              ) : colorPalette ? (
                <ColorPaletteDisplay
                  palette={colorPalette}
                  onColorChange={handleColorChange}
                />
              ) : workspaceData.images.length === 0 ? (
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-8 shadow-xl">
                  <p className="text-zinc-400 text-center text-lg">
                    No images found to extract colors from
                  </p>
                </div>
              ) : null}

              {/* Selected Colors Preview */}
              {selectedColors && (
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 shadow-xl">
                  <p className="text-sm font-medium text-zinc-400 mb-4">Active Color Palette</p>
                  <div className="flex gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-xl border-2 border-zinc-700/50 shadow-lg"
                        style={{ backgroundColor: selectedColors.background }}
                        role="img"
                        aria-label={`Background color: ${selectedColors.background}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-300 mb-1">Background</p>
                        <code className="text-xs text-zinc-400 uppercase font-mono" aria-label={`Color code: ${selectedColors.background}`}>{selectedColors.background}</code>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-xl border-2 border-zinc-700/50 shadow-lg"
                        style={{ backgroundColor: selectedColors.accent }}
                        role="img"
                        aria-label={`Accent color: ${selectedColors.accent}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-300 mb-1">Accent</p>
                        <code className="text-xs text-zinc-400 uppercase font-mono" aria-label={`Color code: ${selectedColors.accent}`}>{selectedColors.accent}</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Book Cover Section */}
            {workspaceData && (
              <div data-component="home-book-cover-section" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    Book Cover
                  </h2>
                  <p className="text-zinc-400 text-base leading-relaxed">
                    Your generated book cover with dynamic colors
                  </p>
                </div>
                <div data-component="home-book-cover-wrapper" className="flex justify-center">
                  <BookSpread 
                    data={workspaceData} 
                    selectedColors={selectedColors || undefined}
                    scale={1.25}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!workspaceData && !isLoading && !error && (
          <div data-component="home-empty-state" className="text-center py-16">
            <p className="text-zinc-400 text-lg mb-2">
              Enter a Workspaces.xyz URL above to get started
            </p>
            <p className="text-zinc-600 text-sm">
              Example: https://www.workspaces.xyz/p/440-dinesh-dave
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
