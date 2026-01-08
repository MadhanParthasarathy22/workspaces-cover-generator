"use server";

import { scrapeWorkspacesPage } from "@/lib/scraper";
import type { ScrapeResult } from "@/lib/types";

/**
 * Server Action to scrape a Workspaces.xyz profile URL
 * Returns structured workspace data or an error message
 */
export async function scrapeWorkspaceUrl(url: string): Promise<ScrapeResult> {
  // Basic validation
  if (!url || typeof url !== "string") {
    return {
      success: false,
      error: "Please provide a URL",
    };
  }

  // Trim and validate URL format
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl.includes("workspaces.xyz")) {
    return {
      success: false,
      error: "URL must be from workspaces.xyz (e.g., https://www.workspaces.xyz/p/440-dinesh-dave)",
    };
  }

  // Ensure it's a profile page URL
  if (!trimmedUrl.includes("/p/")) {
    return {
      success: false,
      error: "Please provide a workspace profile URL (should contain /p/ in the path)",
    };
  }

  try {
    const data = await scrapeWorkspacesPage(trimmedUrl);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while scraping",
    };
  }
}

