export interface HistoryItem {
  animeId: string;
  animeTitle: string;
  episodeNumber: number;
  thumbnail: string;
  watchUrl: string;
  timestamp: number;
}

const STORAGE_KEY = "mag_watch_history";

export const historyStorage = {
  // Get all history items sorted by most recently watched
  getAll(): HistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const items: HistoryItem[] = JSON.parse(stored);
      return items.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error reading watch history storage:", error);
      return [];
    }
  },

  // Save an item to history
  save(item: Omit<HistoryItem, "timestamp">) {
    if (typeof window === "undefined") return;
    try {
      const items = this.getAll();
      
      // Remove any existing entry for the exact same watch URL to avoid duplicates
      const filtered = items.filter((i) => i.watchUrl !== item.watchUrl);
      
      const newItem: HistoryItem = {
        ...item,
        timestamp: Date.now(),
      };
      
      filtered.push(newItem);
      
      // Limit to 100 entries max (Requirement 6)
      const updated = filtered
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Trigger standard event for sync
      window.dispatchEvent(new Event("mag_history_updated"));
    } catch (error) {
      console.error("Error saving watch history item:", error);
    }
  },

  // Remove a specific entry from history
  remove(watchUrl: string) {
    if (typeof window === "undefined") return;
    try {
      const items = this.getAll();
      const filtered = items.filter((i) => i.watchUrl !== watchUrl);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event("mag_history_updated"));
    } catch (error) {
      console.error("Error removing watch history item:", error);
    }
  },

  // Clear all history
  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("mag_history_updated"));
    } catch (error) {
      console.error("Error clearing watch history:", error);
    }
  }
};
