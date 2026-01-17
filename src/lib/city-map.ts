/**
 * Short forms/abbreviations to location mapping
 * Maps popular location abbreviations to formatted "City, Country" strings
 * Checked before full city names for more specific matching
 */
export const SHORT_FORMS_MAP: Record<string, string> = {
  // USA
  "SF": "San Francisco, USA",
  "NYC": "New York, USA",
  "LA": "Los Angeles, USA",
  "DC": "Washington DC, USA",
  "ATX": "Austin, USA",
  "SEA": "Seattle, USA",
  "PDX": "Portland, USA",
  "CHI": "Chicago, USA",
  "BOS": "Boston, USA",
  "MIA": "Miami, USA",
  "DEN": "Denver, USA",
  "SD": "San Diego, USA",
  "PHX": "Phoenix, USA",
  "ATL": "Atlanta, USA",
  "DFW": "Dallas, USA",
  "HOU": "Houston, USA",
  "PHL": "Philadelphia, USA",
  "DET": "Detroit, USA",
  "MSP": "Minneapolis, USA",
  "IND": "Indianapolis, USA",
  "CVG": "Cincinnati, USA",
  "CLT": "Charlotte, USA",
  "RDU": "Raleigh, USA",
  "STL": "St. Louis, USA",
  "BWI": "Baltimore, USA",
  
  // Canada
  "YYZ": "Toronto, Canada",
  "YVR": "Vancouver, Canada",
  "YUL": "Montreal, Canada",
  
  // UK
  "LDN": "London, UK",
  "MCR": "Manchester, UK",
  "EDI": "Edinburgh, UK",
};

/**
 * City to location mapping
 * Maps city names to formatted "City, Country" strings
 * Used for location extraction from workspace profiles
 */
export const CITY_MAP: Record<string, string> = {
  // India
  "Delhi": "Delhi, India",
  "Mumbai": "Mumbai, India",
  "Bangalore": "Bangalore, India",
  "Bangaluru": "Bangaluru, India",
  "Hyderabad": "Hyderabad, India",
  "Chennai": "Chennai, India",
  "Pune": "Pune, India",
  "Kolkata": "Kolkata, India",
  "Ahmedabad": "Ahmedabad, India",
  "Gurgaon": "Gurgaon, India",
  
  // USA
  "New York": "New York, USA",
  "San Francisco": "San Francisco, USA",
  "Los Angeles": "Los Angeles, USA",
  "Seattle": "Seattle, USA",
  "Austin": "Austin, USA",
  "Boston": "Boston, USA",
  "Chicago": "Chicago, USA",
  "Miami": "Miami, USA",
  "Portland": "Portland, USA",
  "Denver": "Denver, USA",
  "San Diego": "San Diego, USA",
  "Washington": "Washington, USA",
  "Washington DC": "Washington DC, USA",
  "DC": "Washington DC, USA",
  "Brooklyn": "Brooklyn, USA",
  "Manhattan": "Manhattan, USA",
  
  // UK
  "London": "London, UK",
  "Manchester": "Manchester, UK",
  "Birmingham": "Birmingham, UK",
  "Edinburgh": "Edinburgh, UK",
  "Bristol": "Bristol, UK",
  "Cambridge": "Cambridge, UK",
  "Oxford": "Oxford, UK",
  "Scotland": "Scotland, UK",
  "England": "England, UK",
  "Wales": "Wales, UK",
  "Northern Ireland": "Northern Ireland, UK",
  
  // Canada
  "Toronto": "Toronto, Canada",
  "Vancouver": "Vancouver, Canada",
  "Montreal": "Montreal, Canada",
  "Ottawa": "Ottawa, Canada",
  "Calgary": "Calgary, Canada",
  
  // Europe
  "Berlin": "Berlin, Germany",
  "Munich": "Munich, Germany",
  "Hamburg": "Hamburg, Germany",
  "Amsterdam": "Amsterdam, Netherlands",
  "Paris": "Paris, France",
  "Barcelona": "Barcelona, Spain",
  "Madrid": "Madrid, Spain",
  "Lisbon": "Lisbon, Portugal",
  "Stockholm": "Stockholm, Sweden",
  "Copenhagen": "Copenhagen, Denmark",
  "Oslo": "Oslo, Norway",
  "Zurich": "Zurich, Switzerland",
  "Vienna": "Vienna, Austria",
  "Dublin": "Dublin, Ireland",
  "Brussels": "Brussels, Belgium",
  "Warsaw": "Warsaw, Poland",
  "Prague": "Prague, Czech Republic",
  "Budapest": "Budapest, Hungary",
  "Rome": "Rome, Italy",
  "Milan": "Milan, Italy",
  
  // Asia Pacific
  "Tokyo": "Tokyo, Japan",
  "Singapore": "Singapore",
  "Hong Kong": "Hong Kong",
  "Sydney": "Sydney, Australia",
  "Melbourne": "Melbourne, Australia",
  "Brisbane": "Brisbane, Australia",
  "Auckland": "Auckland, New Zealand",
  "Seoul": "Seoul, South Korea",
  "Shanghai": "Shanghai, China",
  "Beijing": "Beijing, China",
  "Shenzhen": "Shenzhen, China",
  "Taipei": "Taipei, Taiwan",
  "Bangkok": "Bangkok, Thailand",
  "Manila": "Manila, Philippines",
  "Jakarta": "Jakarta, Indonesia",
  "Kuala Lumpur": "Kuala Lumpur, Malaysia",
  
  // Middle East
  "Dubai": "Dubai, UAE",
  "Tel Aviv": "Tel Aviv, Israel",
  "Jerusalem": "Jerusalem, Israel",
  
  // Latin America
  "São Paulo": "São Paulo, Brazil",
  "Rio de Janeiro": "Rio de Janeiro, Brazil",
  "Mexico City": "Mexico City, Mexico",
  "Buenos Aires": "Buenos Aires, Argentina",
  "Santiago": "Santiago, Chile",
  "Bogotá": "Bogotá, Colombia",
  "Lima": "Lima, Peru",
  
  // Africa
  "Cape Town": "Cape Town, South Africa",
  "Johannesburg": "Johannesburg, South Africa",
  "Lagos": "Lagos, Nigeria",
  "Nairobi": "Nairobi, Kenya",
};

/**
 * Find a city in text and return its formatted location
 * Uses case-insensitive word-boundary matching
 * Checks short forms first (more specific), then full city names
 */
export function findCityInText(text: string): string | null {
  // First check short forms (they're more specific and should be matched first)
  for (const [shortForm, formattedLocation] of Object.entries(SHORT_FORMS_MAP)) {
    // Escape special regex characters and use word boundaries to match whole words only
    const escapedShortForm = shortForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedShortForm}\\b`, 'i');
    
    if (regex.test(text)) {
      return formattedLocation;
    }
  }
  
  // Then check full city names
  for (const [cityName, formattedLocation] of Object.entries(CITY_MAP)) {
    // Escape special regex characters and use word boundaries to match whole words only
    const escapedCity = cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedCity}\\b`, 'i');
    
    if (regex.test(text)) {
      return formattedLocation;
    }
  }
  
  return null;
}
