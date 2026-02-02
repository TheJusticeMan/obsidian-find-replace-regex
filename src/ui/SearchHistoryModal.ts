import { App, ExtraButtonComponent, SuggestModal } from "obsidian";
import { SearchHistoryEntry } from "../settings";
import { SearchHistoryManager } from "../utils/history";

export class SearchHistoryModal extends SuggestModal<SearchHistoryEntry> {
  constructor(
    app: App,
    private history: SearchHistoryEntry[],
    private onSelect: (entry: SearchHistoryEntry) => void,
  ) {
    super(app);
    this.setPlaceholder("Search history...");
  }

  getSuggestions(query: string): SearchHistoryEntry[] {
    const q = query.toLowerCase();
    return this.history
      .filter(
        (e) =>
          e.query.toLowerCase().includes(q) ||
          e.replace.toLowerCase().includes(q),
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }

  renderSuggestion(entry: SearchHistoryEntry, el: HTMLElement) {
    el.setCssStyles({ display: "flex", justifyContent: "space-between" });

    el.createDiv({ text: entry.query });
    el.createDiv({ text: entry.replace });

    new ExtraButtonComponent(el)
      .setTooltip("Delete this entry")
      .setIcon("trash-2")
      .onClick(() => void this.onDeleteEntry(entry));
  }

  private onDeleteEntry(entry: SearchHistoryEntry) {
    new SearchHistoryManager((newHistory) => {
      this.history = newHistory;
      this.inputEl.dispatchEvent(new Event("input"));
    }).deleteEntry(this.history, entry);
  }

  onChooseSuggestion(entry: SearchHistoryEntry) {
    this.onSelect(entry);
  }
}
