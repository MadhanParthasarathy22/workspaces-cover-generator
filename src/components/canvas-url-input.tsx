"use client";

import { useRef, useState } from "react";

interface CanvasUrlInputProps {
  onSubmit: (url: string) => void;
  onRegenerateColors: () => void;
  isLoading?: boolean;
  showControls?: boolean;
  currentColorIndex?: number;
  totalColors?: number;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
}

export function CanvasUrlInput({
  onSubmit,
  onRegenerateColors,
  isLoading = false,
  showControls = false,
  currentColorIndex = 0,
  totalColors = 0,
  onNavigatePrevious,
  onNavigateNext,
}: CanvasUrlInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isPreviousClicked, setIsPreviousClicked] = useState(false);
  const [isNextClicked, setIsNextClicked] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = inputRef.current?.value?.trim();
    if (url) {
      onSubmit(url);
    }
  }

  function handlePreviousClick() {
    if (onNavigatePrevious) {
      setIsPreviousClicked(true);
      onNavigatePrevious();
      setTimeout(() => setIsPreviousClicked(false), 200);
    }
  }

  function handleNextClick() {
    if (onNavigateNext) {
      setIsNextClicked(true);
      onNavigateNext();
      setTimeout(() => setIsNextClicked(false), 200);
    }
  }

  if (showControls) {
    // Morph state: Show "Regenerate Colours" button and pagination controls
    return (
      <div
        className="bg-[#1e1e1e] h-[44px] rounded-[16px] pl-[6px] pr-[6px] py-[6px] flex items-center gap-[4px] transition-all duration-300 ease-in-out"
        data-component="canvas-url-input-controls"
      >
        <button
          onClick={onRegenerateColors}
          className="bg-[#333] h-full flex items-center justify-center px-[16px] py-0 rounded-[10px] shrink-0 transition-all duration-300 ease-in-out hover:bg-[#333]/50 active:scale-95 relative cursor-pointer select-none"
          aria-label="Regenerate color palette"
        >
          <p className="text-[#f4f5f6] text-[13px] font-[550] leading-normal relative z-10">
            Regenerate Colours
          </p>
        </button>
        <button
          onClick={handlePreviousClick}
          disabled={!onNavigatePrevious}
          className="bg-transparent h-full flex items-center justify-center px-[8px] py-0 rounded-[10px] shrink-0 transition-all duration-100 ease-in-out hover:bg-[#333]/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-transparent relative cursor-pointer select-none w-[32px]"
          aria-label="Previous color pair"
        >
          <svg
            className={`h-[13px] w-[13px] text-[#f4f5f6] -scale-x-100 transition-transform duration-200 ease-in-out ${
              isPreviousClicked ? "-translate-x-1" : "translate-x-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" className="opacity-30" />
          </svg>
        </button>
        <p 
          className="text-[#f4f5f6] text-[13px] font-[550] leading-normal opacity-30 cursor-default select-none w-[50px] text-center"
          aria-label={`Color pair ${currentColorIndex} of ${totalColors}`}
        >
          {currentColorIndex} / {totalColors}
        </p>
        <button
          onClick={handleNextClick}
          disabled={!onNavigateNext}
          className="bg-transparent h-full flex items-center justify-center px-[8px] py-0 rounded-[10px] shrink-0 transition-all duration-100 ease-in-out hover:bg-[#333]/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-transparent relative cursor-pointer select-none w-[32px]"
          aria-label="Next color pair"
        >
          <svg
            className={`h-[13px] w-[13px] text-[#f4f5f6] transition-transform duration-200 ease-in-out ${
              isNextClicked ? "translate-x-1" : "translate-x-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" className="opacity-30" />
          </svg>
        </button>
      </div>
    );
  }

  // Input state: Show input field and "Generate Cover" button
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] h-[44px] rounded-[16px] p-[6px] flex items-center justify-between transition-all duration-300 ease-in-out"
      data-component="canvas-url-input-form"
    >
      <div className="bg-[#1e1e1e] flex-1 h-full flex items-center justify-center px-[12px] py-[4px] rounded-[10px] transition-all duration-300 ease-in-out">
        <label htmlFor="canvas-workspace-url" className="sr-only">
          Workspace URL
        </label>
        <input
          id="canvas-workspace-url"
          ref={inputRef}
          type="url"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a workspaces link.."
          className="w-full h-full bg-transparent text-[#f4f5f6] text-[13px] font-[550] leading-normal placeholder:text-[#f4f5f6] placeholder:opacity-30 focus:outline-none"
          disabled={isLoading}
          aria-label="Workspace URL"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-[#333] h-full flex items-center justify-center px-[16px] py-0 rounded-[10px] shrink-0 transition-all duration-300 ease-in-out hover:bg-[#333]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 relative min-w-[128px]"
        aria-label={isLoading ? "Scraping workspace data" : "Generate Cover"}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-[11px] w-[11px] text-[#f4f5f6]"
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
        ) : (
          <p
            className={`text-[#f4f5f6] text-[13px] font-[550] leading-normal transition-opacity duration-300 relative z-10 ${
              inputValue.trim() ? "" : "opacity-30"
            }`}
          >
            Generate Cover
          </p>
        )}
      </button>
    </form>
  );
}
