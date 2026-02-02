import { EditorView } from "@codemirror/view";
import { App } from "obsidian";
import { SearchMatcher } from "../search/SearchMatcher";
import { SearchInput } from "../ui/SearchInput";
import { BaseSearchInput } from "../ui/BaseSearchInput";
import {
  getSearchQuery,
  getReplaceQuery,
  getSearchOptions,
  getMatchIndex,
  setMatchIndex,
} from "../state";
import { SearchAndReplaceRegexSettings } from "../settings";

export class SearchHandler {
  constructor(
    private view: EditorView,
    private app: App,
    private settings: SearchAndReplaceRegexSettings,
    private matcher: SearchMatcher,
    private searchInput?: SearchInput,
    private replaceInput?: BaseSearchInput,
  ) {}

  private getMatches() {
    const query = getSearchQuery(this.view.state);
    const options = getSearchOptions(this.view.state);
    if (!query) return null;

    this.matcher.updateRegex(query, options);
    if (!this.matcher.isValid()) return null;

    const text = this.view.state.doc.toString();
    return { text, matches: this.matcher.findMatches(text) };
  }

  navigate(direction: number) {
    const data = this.getMatches();
    if (!data || data.matches.length === 0) return;

    const currentIndex = getMatchIndex(this.view.state);
    const newIndex =
      (currentIndex + direction + data.matches.length) % data.matches.length;
    const targetMatch = data.matches[newIndex];
    if (!targetMatch) return;

    this.view.dispatch({
      selection: { anchor: targetMatch.start, head: targetMatch.end },
      effects: [
        EditorView.scrollIntoView(targetMatch.start, { y: "center" }),
        setMatchIndex.of(newIndex),
      ],
    });
  }

  async replace(all = false) {
    const data = this.getMatches();
    if (!data || data.matches.length === 0) return;

    const replaceText = getReplaceQuery(this.view.state);
    const doc = this.view.state.doc;
    let newText: string;
    let replaced = false;

    if (all) {
      newText = this.matcher.replaceMatches(data.text, replaceText);
      replaced = true;
    } else {
      const res = this.matcher.replaceSingleMatch(
        data.text,
        replaceText,
        getMatchIndex(this.view.state),
      );
      newText = res.result;
      replaced = res.replaced;
    }

    if (replaced) {
      this.view.dispatch({
        changes: { from: 0, to: doc.length, insert: newText },
      });
      if (!all) {
        const move =
          (this.getMatches()?.matches.length || 0) - data.matches.length + 1;
        this.navigate(move);
      }
    }
  }

  updateSearchCount() {
    if (!this.searchInput) return;
    const data = this.getMatches();
    const count = data ? data.matches.length : 0;
    const current = count > 0 ? getMatchIndex(this.view.state) : 0;
    this.searchInput.updateSearchCount(current, count);
  }
}
