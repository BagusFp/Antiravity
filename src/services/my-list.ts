export interface MyListItem {
  id: string;             // Prefixed or raw ID (e.g., otakudesu:evangelion)
  title: string;          // Anime title
  image: string;          // Anime poster image
  slug: string;           // URL slug or raw ID for direct details navigation
  type: string;           // Series type (TV, Movie, OVA, etc.)
  rating?: string;        // Anime rating/score
  episodesCount?: number;  // Optional episode count
  addedAt: number;        // Timestamp when added
}

const STORAGE_KEY = "mag_my_list";

export const myListService = {
  /**
   * Retrieve all items stored in the user's local "My List".
   * Returns a copy sorted by addedAt descending (newest additions first).
   */
  getItems(): MyListItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        // Safe reset if data corrupted
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      return parsed.sort((a, b) => b.addedAt - a.addedAt);
    } catch (error) {
      console.error("[My List Service] Failed to retrieve or parse My List items:", error);
      return [];
    }
  },

  /**
   * Add a new anime item to the user's local "My List".
   */
  addItem(anime: Omit<MyListItem, "addedAt">): void {
    if (typeof window === "undefined") return;
    try {
      const items = this.getItems();
      
      // Prevent duplicate entries
      if (items.some((item) => item.id === anime.id)) {
        return;
      }

      const newItem: MyListItem = {
        ...anime,
        addedAt: Date.now(),
      };

      const updated = [...items, newItem];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Dispatch standard DOM event to notify other UI components instantly
      window.dispatchEvent(new Event("mag_my_list_updated"));
    } catch (error) {
      console.error("[My List Service] Failed to add item to My List:", error);
    }
  },

  /**
   * Remove an anime item from the user's local "My List" by ID.
   */
  removeItem(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const items = this.getItems();
      const updated = items.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Dispatch standard DOM event to notify other UI components instantly
      window.dispatchEvent(new Event("mag_my_list_updated"));
    } catch (error) {
      console.error("[My List Service] Failed to remove item from My List:", error);
    }
  },

  /**
   * Check if a specific anime item exists in the user's local "My List".
   */
  hasItem(id: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const items = this.getItems();
      return items.some((item) => item.id === id);
    } catch {
      return false;
    }
  },

  /**
   * Toggle the inclusion of an anime item in the local "My List".
   * Returns true if the item was added, or false if it was removed.
   */
  toggleItem(anime: Omit<MyListItem, "addedAt">): boolean {
    const exists = this.hasItem(anime.id);
    if (exists) {
      this.removeItem(anime.id);
      return false;
    } else {
      this.addItem(anime);
      return true;
    }
  }
};
