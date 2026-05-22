/**
 * Sanitizes the synopsis/description text returned by external APIs.
 * E.g., removes MAL advertisement text and standardizes spacing.
 */
export function sanitizeSynopsis(text?: string): string {
  if (!text) return "No description available.";
  
  return text
    .replace(/\[Written by MAL Rewrite\]/gi, "")
    .replace(/\(Source: .*\)/gi, "")
    .trim();
}

/**
 * Standardizes a rating code into a clean, unified label (e.g. PG-13, R, G, PG).
 */
export function formatRating(rating?: string): string {
  if (!rating) return "N/A";
  
  if (rating.toLowerCase().includes("pg-13") || rating.toLowerCase().includes("pg 13")) {
    return "PG-13";
  }
  if (rating.toLowerCase().includes("r -") || rating.toLowerCase().includes("17+")) {
    return "17+";
  }
  if (rating.toLowerCase().includes("r+") || rating.toLowerCase().includes("18+")) {
    return "18+";
  }
  if (rating.toLowerCase().includes("pg") || rating.toLowerCase().includes("parental guidance")) {
    return "PG";
  }
  if (rating.toLowerCase().includes("g -") || rating.toLowerCase().includes("all ages")) {
    return "G";
  }
  
  return rating.split(" ")[0] || "N/A";
}

/**
 * Normalizes provider IDs to ensure they are consistent URL-friendly slugs
 */
export function cleanId(id: string | number): string {
  return String(id).trim().toLowerCase();
}
