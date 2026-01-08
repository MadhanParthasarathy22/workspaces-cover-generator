"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function UrlInput({
  onSubmit,
  isLoading = false,
  placeholder = "https://www.workspaces.xyz/p/440-dinesh-dave",
}: UrlInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = inputRef.current?.value?.trim();
    if (url) {
      onSubmit(url);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <Input
        ref={inputRef}
        type="url"
        placeholder={placeholder}
        className="flex-1 h-12 text-base bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 px-6 bg-amber-600 hover:bg-amber-500 text-white font-medium"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
            Scraping...
          </span>
        ) : (
          "Scrape"
        )}
      </Button>
    </form>
  );
}

