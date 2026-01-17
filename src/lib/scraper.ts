import * as cheerio from "cheerio";
import type { WorkspaceData } from "./types";
import { findCityInText } from "./city-map";

/**
 * Helper function to check if text length is valid for gear items
 * Allows shorter names for known gear terms like "Mac", "PC", "iPad"
 */
function isValidGearItemLength(text: string): boolean {
  const shortGearTerms = ["mac", "pc", "ipad", "iphone", "mbp", "imac"];
  const textLower = text.toLowerCase().trim();
  
  // Check if it's a known short gear term
  const isShortGear = shortGearTerms.some(term => textLower === term || textLower.startsWith(term + " "));
  
  // Allow 2+ chars for short gear terms, 3+ for others
  const minLength = isShortGear ? 2 : 3;
  return text.length >= minLength && text.length < 200;
}

/**
 * Context-aware detection for gear items
 * Checks if text looks like a gear/workspace item based on patterns
 */
function isLikelyGearItem(text: string): boolean {
  const textLower = text.toLowerCase().trim();
  
  // Filter out common false positives
  const excludePatterns = [
    "→", "subscribe", "newsletter", "submit", "gift guide", 
    "past editions", "twitter", "instagram", "linkedin", "threads"
  ];
  
  if (excludePatterns.some(pattern => textLower.includes(pattern))) {
    return false;
  }
  
  // Filter out social handles (pattern: Name (@handle) or @handle)
  if (text.includes("@") && /@\w+/.test(text)) {
    return false;
  }
  
  // Gear keywords
  const gearKeywords = [
    // Hardware
    "desk", "chair", "monitor", "keyboard", "mouse", "mac", "macbook", "laptop", "display", 
    "light", "lamp", "camera", "microphone", "headphone", "speaker", "stand", "mount",
    "hub", "dock", "cable", "webcam", "ipad", "tablet", "phone", "imac", "pc",
    // Furniture & accessories
    "shelf", "shelving", "bench", "table", "drawer", "cabinet", "plant", "poster",
    "rug", "mat", "coaster", "organizer", "holder",
    // Brands commonly mentioned
    "herman miller", "apple", "lg", "dell", "asus", "logitech", "sony", "bose",
    "ikea", "autonomous", "secretlab", "steelcase", "uplift", "jarvis",
    // Generic workspace terms
    "pro", "studio", "ultra", "mini", "air"
  ];
  
  // Software/app keywords
  const softwareKeywords = [
    "notion", "figma", "slack", "discord", "zoom", "teams", "vscode", "code",
    "chrome", "safari", "firefox", "arc", "spotify", "terminal", "iterm",
    "obsidian", "roam", "craft", "bear", "things", "todoist", "linear",
    "github", "gitlab", "vercel", "netlify", "aws", "docker", "postman"
  ];
  
  // Check for gear keywords
  const isGear = gearKeywords.some(keyword => textLower.includes(keyword));
  const isSoftware = softwareKeywords.some(keyword => textLower.includes(keyword));
  
  // Check for brand/product patterns (numbers, Pro, Air, etc.)
  const hasProductPattern = /(pro|air|studio|ultra|mini|max|plus)\b/i.test(text) || 
                           /\d{3,4}/.test(text) || // Model numbers
                           /^[A-Z][a-z]+ [A-Z]/.test(text); // Brand Model format
  
  return isGear || isSoftware || hasProductPattern;
}

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

  // #region agent log - Hypothesis D: Log HTML length to check if content is present
  console.log('[DEBUG-D] HTML fetched:', { htmlLength: html.length, hasWorkspaceItems: html.toLowerCase().includes('workspace items'), bodyTextLength: $('body').text().length });
  // #endregion

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

  // Extract location from title and first 2 paragraphs
  // Location information typically appears in the title/subtitle or early in the profile
  const firstTwoParagraphs = bioElements.slice(0, 2).join("\n\n");
  const searchText = `${title} ${firstTwoParagraphs}`;
  let location: string | undefined;
  
  // Check for city names in the title and first 2 paragraphs
  const foundCity = findCityInText(searchText);
  if (foundCity) {
    location = foundCity;
  } else {
    // Fallback: if no location found, use "Earth, Milky Way"
    location = "Earth, Milky Way";
  }

  // Extract workspace items - look for lists after "Workspace Items" heading
  const workspaceItems: string[] = [];
  
  // #region agent log - Hypothesis A: Log all h2/h3/h4 headings found
  const allHeadings: string[] = [];
  $("h2, h3, h4").each((_, heading) => {
    allHeadings.push($(heading).text().trim());
  });
  console.log('[DEBUG-A] All headings found:', { headings: allHeadings, count: allHeadings.length });
  // #endregion
  
  // #region agent log - Hypothesis B/E: Log all list items and links in page
  const allListItems: string[] = [];
  $("li").each((_, li) => { allListItems.push($(li).text().trim().substring(0, 100)); });
  const allLinks: string[] = [];
  $("a").each((_, a) => { 
    const text = $(a).text().trim();
    const href = $(a).attr('href') || '';
    if (text.length > 5 && text.length < 100 && !href.includes('twitter') && !href.includes('instagram')) {
      allLinks.push(text);
    }
  });
  console.log('[DEBUG-B] Page content:', { listItemCount: allListItems.length, linkCount: allLinks.length, sampleListItems: allListItems.slice(0, 15), sampleLinks: allLinks.slice(0, 20) });
  // #endregion
  
  // Expanded heading patterns to match more workspace-related sections
  const headingPatterns = [
    "workspace items", "gear", "setup", "office", 
    "tool stack", "software", "tools", "equipment",
    "what is in your", "what's in your", "desk setup",
    // Personal heading variations
    "my setup", "my gear", "my workspace", "what i use", "what i'm using",
    // Section variations
    "tech stack", "hardware", "software stack", "peripherals", "devices",
    // Additional patterns
    "stack", "tools i use", "favorite tools", "current setup"
  ];
  
  // Find the "Workspace Items" section - using improved traversal
  $("h2, h3, h4").each((_, heading) => {
    const headingText = $(heading).text().toLowerCase();
    // #region agent log - Hypothesis A: Check heading match
    const matchesPattern = headingPatterns.some(p => headingText.includes(p));
    console.log('[DEBUG-A2] Heading check:', { headingText, matchesPattern });
    // #endregion
    
    if (matchesPattern) {
      // #region agent log - Hypothesis C: Log matched heading and start traversal
      console.log('[DEBUG-C] Matched heading - starting traversal:', { headingText });
      // #endregion
      
      const $heading = $(heading);
      
      // Strategy 1: Recursive parent search up to 4 levels
      let $current = $heading;
      let level = 0;
      const maxLevels = 4;
      let foundInParents = false;
      
      while (level < maxLevels && $current.length) {
        const $parent = $current.parent();
        if (!$parent.length || $parent.is('body') || $parent.is('html')) break;
        
        // Search for lists in this parent level
        $parent.find("ul, ol").each((_, list) => {
          $(list).find("li").each((_, li) => {
            const itemText = $(li).text().trim();
            if (itemText && isValidGearItemLength(itemText) && isLikelyGearItem(itemText) && !workspaceItems.includes(itemText)) {
              workspaceItems.push(itemText);
              foundInParents = true;
            }
          });
        });
        
        // Also check for bullet points in paragraphs/divs at this level
        $parent.find("p, div").each((_, el) => {
          const text = $(el).text().trim();
          // Check for single bullet items
          if (text && (text.startsWith("•") || text.startsWith("*") || text.startsWith("-") || text.startsWith("◦"))) {
            const item = text.replace(/^[*•\-◦]\s*/, "").trim();
            if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
              workspaceItems.push(item);
              foundInParents = true;
            }
          }
          // Check for multi-line bullet lists
          const lines = text.split(/\n/);
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && (trimmedLine.startsWith("•") || trimmedLine.startsWith("*") || trimmedLine.startsWith("-") || trimmedLine.startsWith("◦"))) {
              const item = trimmedLine.replace(/^[*•\-◦]\s*/, "").trim();
              if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
                workspaceItems.push(item);
                foundInParents = true;
              }
            }
          }
        });
        
        $current = $parent;
        level++;
      }
      
      // Also search in common content containers
      const contentSelectors = [".content", "article", "main", "[class*='post']", "[class*='content']"];
      for (const selector of contentSelectors) {
        const $container = $heading.closest(selector);
        if ($container.length) {
          $container.find("ul, ol").each((_, list) => {
            $(list).find("li").each((_, li) => {
              const itemText = $(li).text().trim();
              if (itemText && isValidGearItemLength(itemText) && isLikelyGearItem(itemText) && !workspaceItems.includes(itemText)) {
                workspaceItems.push(itemText);
                foundInParents = true;
              }
            });
          });
        }
      }
      
      // #region agent log - Parent search result
      console.log('[DEBUG-C-PARENT] Recursive parent container search:', { foundInParents, itemsNow: workspaceItems.length, levelsSearched: level });
      // #endregion
      
      // Strategy 2: Also try sibling traversal (original approach)
      let next = $heading.next();
      let siblingCount = 0;
      while (next.length && !next.is("h2, h3, h4")) {
        siblingCount++;
        const tagName = next.prop('tagName');
        const isUlOl = next.is("ul, ol");
        // #region agent log - Hypothesis C: Log each sibling element
        if (siblingCount <= 5) console.log('[DEBUG-C2] Sibling element:', { siblingCount, tagName, isUlOl, textPreview: next.text().substring(0, 50) });
        // #endregion
        
        // Check for lists (direct or nested)
        if (next.is("ul, ol")) {
          next.find("li").each((_, li) => {
            const itemText = $(li).text().trim();
            if (itemText && isValidGearItemLength(itemText) && isLikelyGearItem(itemText) && !workspaceItems.includes(itemText)) {
              workspaceItems.push(itemText);
            }
          });
        }
        
        // Also search inside divs for nested lists
        if (next.is("div")) {
          next.find("ul li, ol li").each((_, li) => {
            const itemText = $(li).text().trim();
            if (itemText && isValidGearItemLength(itemText) && isLikelyGearItem(itemText) && !workspaceItems.includes(itemText)) {
              workspaceItems.push(itemText);
            }
          });
        }
        
        // Enhanced bullet point extraction in paragraphs and divs
        if (next.is("p") || next.is("div") || next.is("span")) {
          const text = next.text().trim();
          
          // Single-line bullet items
          if (text && (text.startsWith("•") || text.startsWith("*") || text.startsWith("-") || text.startsWith("◦"))) {
            const item = text.replace(/^[*•\-◦]\s*/, "").trim();
            if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
              workspaceItems.push(item);
            }
          }
          
          // Multi-line bullet lists (markdown-style)
          const lines = text.split(/\n/);
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && (trimmedLine.startsWith("•") || trimmedLine.startsWith("*") || trimmedLine.startsWith("-") || trimmedLine.startsWith("◦"))) {
              const item = trimmedLine.replace(/^[*•\-◦]\s*/, "").trim();
              if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
                workspaceItems.push(item);
              }
            }
          }
        }
        
        next = next.next();
      }
      // #region agent log - Hypothesis C: After sibling loop
      console.log('[DEBUG-C3] After sibling traversal:', { siblingCount, itemsFound: workspaceItems.length });
      // #endregion
    }
  });

  // #region agent log - Hypothesis A/B: Items after heading extraction
  console.log('[DEBUG-A3] After heading extraction:', { itemCount: workspaceItems.length, items: workspaceItems });
  // #endregion

  // Enhanced fallback: Look for gear items in lists and other elements
  if (workspaceItems.length === 0) {
    // #region agent log - Hypothesis B: Fallback triggered
    console.log('[DEBUG-B2] Fallback keyword extraction triggered');
    // #endregion
    
    // Process list items
    $("li").each((_, li) => {
      const text = $(li).text().trim();
      if (isValidGearItemLength(text) && isLikelyGearItem(text) && !workspaceItems.includes(text)) {
        workspaceItems.push(text);
      }
    });
    
    // Process paragraph elements with bullet points
    $("p").each((_, p) => {
      const text = $(p).text().trim();
      
      // Single-line bullet items
      if (text && (text.startsWith("•") || text.startsWith("*") || text.startsWith("-") || text.startsWith("◦"))) {
        const item = text.replace(/^[*•\-◦]\s*/, "").trim();
        if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
          workspaceItems.push(item);
        }
      }
      
      // Multi-line bullet lists
      const lines = text.split(/\n/);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && (trimmedLine.startsWith("•") || trimmedLine.startsWith("*") || trimmedLine.startsWith("-") || trimmedLine.startsWith("◦"))) {
          const item = trimmedLine.replace(/^[*•\-◦]\s*/, "").trim();
          if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
            workspaceItems.push(item);
          }
        }
      }
    });
    
    // Process div elements with bullet points
    $("div").each((_, div) => {
      const text = $(div).text().trim();
      
      // Single-line bullet items (but not if it's a container with nested content)
      if (text && text.length < 200 && (text.startsWith("•") || text.startsWith("*") || text.startsWith("-") || text.startsWith("◦"))) {
        const item = text.replace(/^[*•\-◦]\s*/, "").trim();
        if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
          workspaceItems.push(item);
        }
      }
      
      // Multi-line bullet lists
      const lines = text.split(/\n/);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && (trimmedLine.startsWith("•") || trimmedLine.startsWith("*") || trimmedLine.startsWith("-") || trimmedLine.startsWith("◦"))) {
          const item = trimmedLine.replace(/^[*•\-◦]\s*/, "").trim();
          if (item && isValidGearItemLength(item) && isLikelyGearItem(item) && !workspaceItems.includes(item)) {
            workspaceItems.push(item);
          }
        }
      }
    });
    
    // Process span elements (often used for inline gear items)
    $("span").each((_, span) => {
      const text = $(span).text().trim();
      // Only process if it's a standalone span (not nested in lists/paragraphs we've already processed)
      const parentTag = $(span).parent().prop('tagName');
      if (parentTag !== 'LI' && parentTag !== 'P' && parentTag !== 'DIV') {
        if (text && isValidGearItemLength(text) && isLikelyGearItem(text) && !workspaceItems.includes(text)) {
          workspaceItems.push(text);
        }
      }
    });
    
    // Process strong/bold tags that might be gear item labels
    $("strong, b").each((_, el) => {
      const text = $(el).text().trim();
      // Only if it's not already in a list item we processed
      const $parent = $(el).parent();
      if (!$parent.is('li')) {
        if (text && isValidGearItemLength(text) && isLikelyGearItem(text) && !workspaceItems.includes(text)) {
          workspaceItems.push(text);
        }
      }
    });
  }
  
  // #region agent log - Final workspace items
  console.log('[DEBUG-FINAL] Final workspace items:', { count: workspaceItems.length, items: workspaceItems });
  // #endregion
  
  // #region agent log - Hypothesis C/E: Check for alternative item structures
  const divWithBullets: string[] = [];
  $("div").each((_, div) => {
    const text = $(div).text().trim();
    if ((text.startsWith("•") || text.startsWith("*") || text.startsWith("-")) && text.length < 150) {
      divWithBullets.push(text.substring(0, 80));
    }
  });
  const strongTags: string[] = [];
  $("strong, b").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 80) strongTags.push(text);
  });
  console.log('[DEBUG-E] Alternative structures:', { divBulletCount: divWithBullets.length, divBullets: divWithBullets.slice(0, 10), strongCount: strongTags.length, strongSamples: strongTags.slice(0, 15) });
  // #endregion

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

