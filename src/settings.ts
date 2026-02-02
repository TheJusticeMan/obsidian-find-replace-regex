import { App, PluginSettingTab, SettingGroup } from "obsidian";
import SearchAndReplaceRegex from "./main";
import { DEFAULT_SEARCH_OPTIONS, SearchOptions } from "./state";

export interface SearchHistoryEntry {
  query: string;
  replace: string;
  options: SearchOptions;
  timestamp: number;
}

export interface SearchAndReplaceRegexSettings {
  defaultSearchOptions: SearchOptions;
  searchHistory: SearchHistoryEntry[];
  maxHistoryItems: number;
}

export const DEFAULT_SETTINGS: SearchAndReplaceRegexSettings = {
  defaultSearchOptions: DEFAULT_SEARCH_OPTIONS,
  searchHistory: [],
  maxHistoryItems: 20,
};

export class SearchAndReplaceRegexSettingTab extends PluginSettingTab {
  icon = "search";
  constructor(
    app: App,
    private plugin: SearchAndReplaceRegex,
  ) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const group = new SettingGroup(containerEl);

    const addToggle = (
      name: string,
      desc: string,
      key: keyof SearchOptions,
    ) => {
      group.addSetting(
        (setting) =>
          void setting
            .setName(name)
            .setDesc(desc)
            .addToggle((t) =>
              t
                .setValue(this.plugin.settings.defaultSearchOptions[key])
                .onChange(async (v) => {
                  this.plugin.settings.defaultSearchOptions[key] = v;
                  await this.plugin.saveSettings();
                }),
            ),
      );
    };

    addToggle(
      "Case sensitive by default",
      "Make search case sensitive by default",
      "caseSensitive",
    );
    addToggle(
      "Whole word by default",
      "Match whole words by default",
      "wholeWord",
    );
    addToggle(
      "Use regex by default",
      "Enable regex mode by default",
      "useRegex",
    );
    group.setHeading("History and confirmations").addSetting(
      (setting) =>
        void setting
          .setName("Maximum history items")
          .setDesc("Maximum number of search history items to keep")
          .addSlider((s) =>
            s
              .setLimits(5, 50, 5)
              .setValue(this.plugin.settings.maxHistoryItems)
              .setDynamicTooltip()
              .onChange(async (v) => {
                this.plugin.settings.maxHistoryItems = v;
                await this.plugin.saveSettings();
              }),
          ),
    );
  }
}
