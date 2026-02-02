import { Plugin } from "obsidian";
import { createSearchExtension } from "./DocumentSearch";
import { registerCommands } from "./commands";
import {
  DEFAULT_SETTINGS,
  SearchAndReplaceRegexSettings,
  SearchAndReplaceRegexSettingTab,
} from "./settings";

export default class SearchAndReplaceRegex extends Plugin {
  settings: SearchAndReplaceRegexSettings;

  async onload() {
    await this.loadSettings();

    this.registerEditorExtension(createSearchExtension(this.app, this));

    registerCommands(this);

    this.addSettingTab(new SearchAndReplaceRegexSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<SearchAndReplaceRegexSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
