import { Range } from "@codemirror/state";
import { SearchMatcher } from "./search/SearchMatcher";
import {
  Decoration,
  DecorationSet,
  EditorView,
  Panel,
  PluginValue,
  showPanel,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import {
  getMatchIndex,
  getSearchOptions,
  getSearchQuery,
  isSearchPanelOpen,
  matchIndexField,
  replaceModeField,
  replaceQueryField,
  searchOptionsField,
  searchPanelOpenField,
  searchQueryField,
  setMatchIndex,
  setSearchOptions,
  setSearchQuery,
  toggleSearchPanel,
} from "./state";
import SearchAndReplaceRegex from "./main";
import { App } from "obsidian";
import { SearchPanel } from "./ui/SearchPanel";

class DocumentSearch implements PluginValue {
  decorations: DecorationSet;
  private matcher: SearchMatcher = new SearchMatcher();

  constructor(view: EditorView) {
    this.decorations = this.computeDecorations(view);
  }

  update(update: ViewUpdate) {
    const changed =
      update.docChanged ||
      update.viewportChanged ||
      update.transactions.some((tr) =>
        tr.effects.some(
          (e) =>
            e.is(setSearchQuery) ||
            e.is(setSearchOptions) ||
            e.is(setMatchIndex) ||
            e.is(toggleSearchPanel),
        ),
      );

    if (changed) this.decorations = this.computeDecorations(update.view);
  }

  computeDecorations(view: EditorView): DecorationSet {
    if (!isSearchPanelOpen(view.state)) return Decoration.none;

    const query = getSearchQuery(view.state);
    if (!query) return Decoration.none;

    this.matcher.updateRegex(query, getSearchOptions(view.state));
    if (!this.matcher.isValid()) return Decoration.none;

    const currentIndex = getMatchIndex(view.state);
    const builder: Range<Decoration>[] = [];

    this.matcher
      .findMatches(view.state.doc.toString())
      .forEach((match, index) => {
        builder.push(
          Decoration.mark({
            class:
              index === currentIndex
                ? "obsidian-search-match-highlight"
                : "cm-highlight",
          }).range(match.start, match.end),
        );
      });

    return Decoration.set(builder, true);
  }
}

export function createSearchExtension(app: App, plugin: SearchAndReplaceRegex) {
  return [
    searchQueryField,
    replaceQueryField,
    searchOptionsField,
    searchPanelOpenField,
    replaceModeField,
    matchIndexField,
    showPanel.from(searchPanelOpenField, (val) =>
      val ? (view: EditorView) => createSearchPanel(view, app, plugin) : null,
    ),
    ViewPlugin.fromClass(DocumentSearch, { decorations: (v) => v.decorations }),
  ];
}

export function createSearchPanel(
  view: EditorView,
  app: App,
  plugin: SearchAndReplaceRegex,
): Panel {
  const searchPanel = new SearchPanel(view, app, plugin.settings, () =>
    plugin.saveSettings(),
  );
  const panelDom = searchPanel.dom;

  view.dom.parentElement?.prepend(panelDom);
  requestAnimationFrame(() => searchPanel.focus());

  return searchPanel.createPanel();
}
