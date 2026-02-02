import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import SearchAndReplaceRegex from "main";
import { Editor } from "obsidian";
import { SearchHandler } from "./handlers/SearchHandler";
import { SearchMatcher } from "./search/SearchMatcher";
import {
  focusSearchInput,
  toggleReplaceMode,
  toggleSearchPanel,
} from "./state";

const dispatchEffects = (editor: Editor, effects: StateEffect<unknown>[]) => {
  // @ts-ignore
  (editor.cm as EditorView)?.dispatch({ effects });
};

const matcher = new SearchMatcher();

export function registerCommands(plugin: SearchAndReplaceRegex) {
  plugin.addCommand({
    id: "open-regex-search",
    name: "Search",
    editorCallback: (editor) =>
      dispatchEffects(editor, [
        toggleSearchPanel.of(true),
        toggleReplaceMode.of(false),
        focusSearchInput.of(),
      ]),
  });

  plugin.addCommand({
    id: "open-regex-replace",
    name: "Replace",
    editorCallback: (editor) =>
      dispatchEffects(editor, [
        toggleSearchPanel.of(true),
        toggleReplaceMode.of(true),
        focusSearchInput.of(),
      ]),
  });

  plugin.addCommand({
    id: "search-next",
    name: "Search next match",
    editorCallback: (editor) => {
      // @ts-ignore
      const view = editor.cm as EditorView;
      if (view)
        new SearchHandler(view, plugin.app, plugin.settings, matcher).navigate(
          1,
        );
    },
  });

  plugin.addCommand({
    id: "search-previous",
    name: "Search previous match",
    editorCallback: (editor) => {
      // @ts-ignore
      const view = editor.cm as EditorView;
      if (view)
        new SearchHandler(view, plugin.app, plugin.settings, matcher).navigate(
          -1,
        );
    },
  });
}
