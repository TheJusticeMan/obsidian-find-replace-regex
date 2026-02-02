import { SearchHistoryEntry } from "../settings";
import { SearchOptions, compareOptions } from "../state";

export class SearchHistoryManager {
  constructor(
    private onHistoryUpdate: (history: SearchHistoryEntry[]) => void,
  ) {}

  addToHistory(
    history: SearchHistoryEntry[],
    entry: SearchHistoryEntry,
    maxItems: number,
  ): SearchHistoryEntry[] {
    if (!entry.query) return history;
    const isSame = (h: SearchHistoryEntry) =>
      h.query === entry.query &&
      h.replace === entry.replace &&
      compareOptions(h.options, entry.options);

    if (history[0] && isSame(history[0])) return history;

    const filtered = history.filter((h) => !isSame(h));
    const newHistory = [entry, ...filtered].slice(0, maxItems);
    this.onHistoryUpdate(newHistory);
    return newHistory;
  }

  deleteEntry(
    history: SearchHistoryEntry[],
    entryToDelete: SearchHistoryEntry,
  ): SearchHistoryEntry[] {
    const newHistory = history.filter(
      (h) => h.timestamp !== entryToDelete.timestamp,
    );
    this.onHistoryUpdate(newHistory);
    return newHistory;
  }

  formatEntry(
    query: string,
    replace: string,
    options: SearchOptions,
  ): SearchHistoryEntry {
    return { query, replace, options, timestamp: Date.now() };
  }
}
