import { EditorView, Panel, ViewUpdate } from "@codemirror/view";
import { App } from "obsidian";
import { SearchAndReplaceRegexSettings, SearchHistoryEntry } from "../settings";
import { SearchMatcher } from "../search/SearchMatcher";
import { SearchHandler } from "../handlers/SearchHandler";
import { BaseSearchInput } from "./BaseSearchInput";
import { SearchHistoryModal } from "./SearchHistoryModal";
import { SearchHistoryManager } from "../utils/history";
import { SearchInput } from "./SearchInput";
import { ToggleButtonComponent } from "./components";
import {
  DEFAULT_SEARCH_OPTIONS,
  focusSearchInput,
  getReplaceQuery,
  getSearchOptions,
  getSearchQuery,
  isReplaceMode,
  SearchOptions,
  setMatchIndex,
  setReplaceQuery,
  setSearchOptions,
  setSearchQuery,
  toggleSearchPanel,
} from "../state";

export class SearchPanel {
  dom: HTMLElement;
  searchInput: SearchInput;
  replaceInput: BaseSearchInput;
  private handler: SearchHandler;
  private historyManager: SearchHistoryManager;
  private matcher: SearchMatcher;
  private historyModal?: SearchHistoryModal;
  private caseSensitiveToggle: ToggleButtonComponent;
  private wholeWordToggle: ToggleButtonComponent;
  private regexToggle: ToggleButtonComponent;
  private currentOptions: SearchOptions;
  private historyIndex = -1;
  private draftEntry: SearchHistoryEntry | null = null;

  constructor(
    private view: EditorView,
    private app: App,
    private settings: SearchAndReplaceRegexSettings,
    private onSettingsChange: () => Promise<void>,
    private initialOptions: SearchOptions = DEFAULT_SEARCH_OPTIONS,
  ) {
    this.currentOptions = { ...this.initialOptions };
    this.dom = document.createElement("div");
    this.dom.classList.add("document-search-container");
    this.setupUI();
    this.updateMode();
    this.matcher = new SearchMatcher();
    this.handler = new SearchHandler(
      view,
      this.app,
      this.settings,
      this.matcher,
      this.searchInput,
      this.replaceInput,
    );
    this.historyManager = new SearchHistoryManager((history) => {
      this.settings.searchHistory = history;
      void this.onSettingsChange();
    });
  }

  private setupUI(): void {
    const searchEl = this.dom.createDiv("document-search");
    const replaceEl = this.dom.createDiv("document-replace");

    this.searchInput = new SearchInput(searchEl, "Enter regex to search...");
    this.replaceInput = new BaseSearchInput(
      replaceEl,
      "Replace with...",
      "document-replace-input",
    );

    this.attachEventHandlers();
    this.attachKeyboardHandlers();
  }

  private attachEventHandlers(): void {
    const opts = getSearchOptions(this.view.state);

    this.searchInput.onChange((v) => {
      this.resetHistory();
      this.view.dispatch({
        effects: [setSearchQuery.of(v), setMatchIndex.of(0)],
      });
    });

    this.caseSensitiveToggle = this.searchInput.addToggle(
      "case-sensitive",
      "Case sensitive",
      opts.caseSensitive,
      (v) => this.updateOptions({ caseSensitive: v }),
    );
    this.wholeWordToggle = this.searchInput.addToggle(
      "whole-word",
      "Whole word",
      opts.wholeWord,
      (v) => this.updateOptions({ wholeWord: v }),
    );
    this.regexToggle = this.searchInput.addToggle(
      "regex",
      "Use regex",
      opts.useRegex,
      (v) => this.updateOptions({ useRegex: v }),
    );

    this.searchInput
      .addBtn("arrow-up", "Previous\nShift + F3", () => {
        this.saveToHistory();
        this.handler.navigate(-1);
      })
      .addBtn("arrow-down", "Next\nf3", () => {
        this.saveToHistory();
        this.handler.navigate(1);
      })
      .addBtn("history", "Search history\nCtrl/Cmd + Down", () =>
        this.showHistory(),
      )
      .addBtn("x", "Exit search", () => this.closeSearch());

    this.replaceInput
      .onChange((v) => {
        this.resetHistory();
        this.view.dispatch({ effects: [setReplaceQuery.of(v)] });
      })
      .addBtn("replace", "Replace & Search\nCtrl/Cmd + Enter", () => {
        this.saveToHistory();
        void this.handler.replace();
      })
      .addBtn("replace-all", "Replace All\nCtrl/Cmd + Shift + H", () => {
        this.saveToHistory();
        void this.handler.replace(true);
      });
  }

  private resetHistory() {
    this.historyIndex = -1;
    this.draftEntry = null;
  }

  private attachKeyboardHandlers(): void {
    const handler = (e: KeyboardEvent) => {
      const isSearchInput = e.target === this.searchInput.getEl();
      const isMod = e.ctrlKey || e.metaKey;
      const key = (isMod ? "Mod+" : "") + (e.shiftKey ? "Shift+" : "") + e.key;

      switch (key) {
        case "Escape":
          this.closeSearch();
          break;
        case "Enter":
        case "F3":
          this.saveToHistory();
          if (isSearchInput) this.handler.navigate(1);
          break;
        case "Shift+Enter":
        case "Shift+F3":
          this.saveToHistory();
          if (isSearchInput) this.handler.navigate(-1);
          break;
        case "Mod+Enter":
          if (!isSearchInput) void this.handler.replace();
          break;
        case "Mod+ArrowDown":
          this.showHistory();
          break;
        case "ArrowDown":
          if (!isMod) this.cycleHistory(-1);
          break;
        case "ArrowUp":
          if (!isMod) this.cycleHistory(1);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    this.searchInput.getEl().addEventListener("keydown", handler);
    this.replaceInput.getEl().addEventListener("keydown", handler);
  }

  private closeSearch(): void {
    this.view.dispatch({ effects: [toggleSearchPanel.of(false)] });
  }

  createPanel(): Panel {
    return {
      dom: document.createElement("div"),
      top: true,
      update: (update) => this.update(update),
      destroy: () => this.destroy(),
    };
  }

  update(update: ViewUpdate): void {
    if (
      update.transactions.some((tr) =>
        tr.effects.some((e) => e.is(focusSearchInput)),
      )
    ) {
      this.searchInput.focus();
    }

    if (
      update.docChanged ||
      update.transactions.some((tr) =>
        tr.effects.some(
          (e) =>
            e.is(setSearchQuery) ||
            e.is(setReplaceQuery) ||
            e.is(setSearchOptions) ||
            e.is(setMatchIndex),
        ),
      )
    ) {
      this.searchInput.setValue(getSearchQuery(update.view.state));
      this.replaceInput.setValue(getReplaceQuery(update.view.state));
      this.setOptions(getSearchOptions(update.view.state));
      this.handler.updateSearchCount();
    }
    this.updateMode();
  }

  private updateMode(): void {
    this.dom.toggleClass("mod-replace-mode", isReplaceMode(this.view.state));
  }

  destroy(): void {
    this.dom.remove();
  }

  private cycleHistory(direction: number): void {
    const history = this.settings.searchHistory;
    if (history.length === 0) return;

    if (this.historyIndex === -1) {
      this.draftEntry = {
        query: getSearchQuery(this.view.state),
        replace: getReplaceQuery(this.view.state),
        options: getSearchOptions(this.view.state),
        timestamp: Date.now(),
      };
    }

    const nextIndex = this.historyIndex + direction;
    if (nextIndex < -1) {
      this.historyIndex = history.length - 1;
    } else if (nextIndex >= history.length) {
      this.historyIndex = -1;
    } else {
      this.historyIndex = nextIndex;
    }

    const entry =
      this.historyIndex === -1 ? this.draftEntry : history[this.historyIndex];
    if (entry) this.applyHistoryEntry(entry);
  }

  private showHistory(): void {
    this.historyModal = new SearchHistoryModal(
      this.app,
      this.settings.searchHistory,
      (entry) => {
        this.applyHistoryEntry(entry);
        this.historyModal?.close();
      },
    );
    this.historyModal.open();
  }

  private applyHistoryEntry(entry: SearchHistoryEntry): void {
    this.view.dispatch({
      effects: [
        setSearchQuery.of(entry.query),
        setReplaceQuery.of(entry.replace),
        setSearchOptions.of(entry.options),
      ],
    });
  }

  private saveToHistory(): void {
    const query = getSearchQuery(this.view.state);
    if (query) {
      const entry = this.historyManager.formatEntry(
        query,
        getReplaceQuery(this.view.state),
        getSearchOptions(this.view.state),
      );
      this.historyManager.addToHistory(
        this.settings.searchHistory,
        entry,
        this.settings.maxHistoryItems,
      );
    }
  }

  focus(): this {
    this.searchInput.focus();
    return this;
  }

  private updateOptions(updates: Partial<SearchOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...updates };
    this.view.dispatch({
      effects: [setSearchOptions.of(this.currentOptions), setMatchIndex.of(0)],
    });
  }

  setOptions(options: SearchOptions): this {
    this.currentOptions = { ...options };
    this.caseSensitiveToggle.setValue(options.caseSensitive);
    this.wholeWordToggle.setValue(options.wholeWord);
    this.regexToggle.setValue(options.useRegex);
    return this;
  }
}
