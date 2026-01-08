import * as cheerio from "cheerio";
import type { WorkspaceData } from "./types";

/**
 * Scrapes workspace data from a Workspaces.xyz profile URL
 */
export async function scrapeWorkspacesPage(
  url: string
): Promise<WorkspaceData> {
  // Validate URL
  if (!url.includes("workspaces.xyz")) {
    throw new Error("URL must be from workspaces.xyz");
  }

  // Fetch the page HTML
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract name from h1
  const name = $("h1").first().text().trim();
  if (!name) {
    throw new Error("Could not find name on page");
  }

  // Extract title - usually right after the h1
  // On Workspaces.xyz, it's typically in a paragraph or subtitle element
  let title = "";
  
  // Try to find the title/role text - it's usually the first text after h1
  // The structure varies, so we check multiple patterns
  const h1Element = $("h1").first();
  
  // Pattern 1: Next sibling paragraph
  const nextP = h1Element.next("p").first();
  if (nextP.length) {
    title = nextP.text().trim();
  }
  
  // Pattern 2: Check for subtitle class or element
  if (!title) {
    const subtitle = $(".subtitle, [class*='subtitle']").first().text().trim();
    if (subtitle) title = subtitle;
  }

  // Pattern 3: Get from meta description or og tags if available
  if (!title) {
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    // Try to extract title from meta if it contains the pattern "Name is a Title..."
    const match = metaDesc.match(/is (?:a |an |the )?(.+?)(?:\.|,|$)/i);
    if (match) title = match[1].trim();
  }

  // Extract bio - paragraphs of text after title, before lists/sections
  const bioElements: string[] = [];
  
  // Promotional/banner keywords to filter out
  const promoKeywords = [
    "reset your workspace",
    "off desks",
    "% off",
    "gift guide",
    "oakywood",
    "discount",
    "promo",
    "sale",
    "shop now",
    "buy now",
    "limited time",
    "sponsored",
  ];
  
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    const textLower = text.toLowerCase();
    
    // Skip empty, very short, or navigation/footer text
    if (text.length < 20) return;
    // Skip if it looks like a list item or section header
    if (text.startsWith("•") || text.startsWith("-")) return;
    // Skip social media patterns
    if (text.includes("→") && (textLower.includes("twitter") || textLower.includes("instagram") || textLower.includes("linkedin") || textLower.includes("threads"))) return;
    // Skip if it's the title we already found
    if (text === title) return;
    // Skip newsletter signup text
    if (textLower.includes("subscribe") || textLower.includes("newsletter") || textLower.includes("inbox")) return;
    // Skip promotional/banner text
    if (promoKeywords.some(keyword => textLower.includes(keyword))) return;
    // Skip "enjoyed this" or "send it to someone" text
    if (textLower.includes("enjoyed this") || textLower.includes("send it to")) return;
    // Skip text that starts with common CTA patterns
    if (textLower.startsWith("if you") && (textLower.includes("enjoyed") || textLower.includes("loved"))) return;
    
    // Check if this paragraph is part of the main content
    const parent = $(el).parent();
    if (parent.is("footer") || parent.hasClass("footer")) return;
    
    // Skip if it contains the person's name followed by typical bio intro patterns
    // but only add it if it's substantive content about the person
    if (text.includes(name) && textLower.includes("is a") || textLower.includes("is the")) {
      bioElements.push(text);
      return;
    }
    
    // Add paragraph if it seems like bio content
    if (bioElements.length < 3) {
      bioElements.push(text);
    }
  });

  const bio = bioElements.slice(0, 3).join("\n\n"); // Take first 3 substantial paragraphs

  // Extract location if present
  // Location is often in a specific format or near certain keywords
  let location: string | undefined;
  
  // Check for location patterns in the page
  const pageText = $("body").text();
  
  // Pattern: "based in [Location]" or "from [Location]" or "living in [Location]"
  const locationPatterns = [
    /based in ([^.,\n]+)/i,
    /from ([A-Z][^.,\n]+)/,
    /living in ([^.,\n]+)/i,
    /located in ([^.,\n]+)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = pageText.match(pattern);
    if (match) {
      location = match[1].trim();
      // Clean up - remove trailing punctuation and limit length
      location = location.replace(/[.!?]+$/, "").trim();
      if (location.length > 50) location = undefined; // Too long, probably not a location
      break;
    }
  }

  // Extract workspace items - look for lists after "Workspace Items" heading
  const workspaceItems: string[] = [];
  
  // Find the "Workspace Items" section
  $("h2, h3").each((_, heading) => {
    const headingText = $(heading).text().toLowerCase();
    if (headingText.includes("workspace items") || headingText.includes("gear") || headingText.includes("setup")) {
      // Get the list items following this heading
      let next = $(heading).next();
      while (next.length && !next.is("h2, h3")) {
        if (next.is("ul, ol")) {
          next.find("li").each((_, li) => {
            const itemText = $(li).text().trim();
            if (itemText && itemText.length < 200) {
              workspaceItems.push(itemText);
            }
          });
        }
        // Also check for list items marked with * in markdown-style content
        if (next.is("p") || next.is("div")) {
          const text = next.text().trim();
          if (text.startsWith("*") || text.startsWith("•") || text.startsWith("-")) {
            const item = text.replace(/^[*•-]\s*/, "").trim();
            if (item && item.length < 200) {
              workspaceItems.push(item);
            }
          }
        }
        next = next.next();
      }
    }
  });

  // Also look for bullet points that might be workspace items
  if (workspaceItems.length === 0) {
    $("li").each((_, li) => {
      const text = $(li).text().trim();
      // Filter for items that look like gear/equipment
      if (
        text.length > 3 &&
        text.length < 200 &&
        !text.includes("→") && // Not a link
        !text.toLowerCase().includes("subscribe") &&
        !text.toLowerCase().includes("newsletter")
      ) {
        // Check if it looks like a product/gear item
        const gearKeywords = ["desk", "chair", "monitor", "keyboard", "mouse", "mac", "laptop", "display", "light", "camera", "microphone", "headphone", "speaker"];
        const isGear = gearKeywords.some((keyword) =>
          text.toLowerCase().includes(keyword)
        );
        if (isGear && !workspaceItems.includes(text)) {
          workspaceItems.push(text);
        }
      }
    });
  }

  // Extract images - filter out logos using URL patterns and HTML position
  const images: string[] = [];
  const seenUrls = new Set<string>();

  // URL patterns to skip (logos, icons, avatars, etc.)
  const SKIP_URL_PATTERNS = [
    "logo",
    "icon",
    "avatar",
    "brand",
    "favicon",
    "badge",
    "emoji",
    "profile-pic",
    "thumbnail",
    "sygnet", // Polish word for signet/logo used by beehiiv
  ];

  // Only get images from content areas, excluding header/nav/footer
  // This filters out the site logo and navigation images
  $("img")
    .not("header img, nav img, footer img")
    .not("[class*='logo'] img, [class*='nav'] img, [class*='header'] img, [class*='footer'] img")
    .each((_, img) => {
      const $img = $(img);
      
      // Skip if parent is in header/nav/footer area
      const parentClasses = $img.parents().map((_, el) => $(el).attr("class") || "").get().join(" ").toLowerCase();
      if (parentClasses.includes("header") || parentClasses.includes("nav") || parentClasses.includes("footer")) {
        return;
      }

      const src = $img.attr("src");
      const dataSrc = $img.attr("data-src"); // Lazy loaded images
      const srcset = $img.attr("srcset");

      const urls = [src, dataSrc];

      // Parse srcset for high-res images
      if (srcset) {
        const srcsetUrls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
        urls.push(...srcsetUrls);
      }

      for (const url of urls) {
        if (!url) continue;
        
        const urlLower = url.toLowerCase();
        
        // Skip SVGs and base64 images
        if (urlLower.includes(".svg") || url.startsWith("data:")) continue;
        
        // Skip if URL contains any skip patterns (logos, icons, etc.)
        if (SKIP_URL_PATTERNS.some(pattern => urlLower.includes(pattern))) continue;
        
        // Skip if we've seen this URL
        if (seenUrls.has(url)) continue;

        // Convert relative URLs to absolute
        let absoluteUrl = url;
        if (url.startsWith("/")) {
          const baseUrl = new URL("https://www.workspaces.xyz");
          absoluteUrl = new URL(url, baseUrl).toString();
        }

        // Filter for workspace-related images (usually large photos)
        // Beehiiv/Workspaces.xyz uses specific CDN patterns
        if (
          absoluteUrl.includes("beehiiv") ||
          absoluteUrl.includes("workspaces") ||
          absoluteUrl.includes("substack") ||
          absoluteUrl.includes("cdn")
        ) {
          seenUrls.add(absoluteUrl);
          images.push(absoluteUrl);
        }
      }
    });

  // Remove "Past Editions" thumbnails (last 6 images) if we have enough images
  const filteredImages = images.length > 6 ? images.slice(0, -6) : images;

  return {
    name,
    title,
    bio,
    location,
    workspaceItems,
    images: filteredImages,
  };
}

