import { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Editor } from "obsidian";
import type SearchAndReplaceRegex from "./main";
import { SearchHandler } from "./handlers/SearchHandler";
import { SearchMatcher } from "./search/SearchMatcher";
import {
  focusSearchInput,
  toggleReplaceMode,
  toggleSearchPanel,
} from "./state";

type EditorWithCodeMirror = Editor & {
  cm?: EditorView;
};

const dispatchEffects = (editor: Editor, effects: StateEffect<unknown>[]) => {
  (editor as EditorWithCodeMirror).cm?.dispatch({ effects });
};

const matcher = new SearchMatcher();

export function registerCommands(plugin: SearchAndReplaceRegex) {
  plugin.addCommand({
    id: "open-regex-search",
    name: "Search",
    editorCallback: (editor: Editor) =>
      dispatchEffects(editor, [
        toggleSearchPanel.of(true),
        toggleReplaceMode.of(false),
        focusSearchInput.of(),
      ]),
  });

  plugin.addCommand({
    id: "open-regex-replace",
    name: "Replace",
    editorCallback: (editor: Editor) =>
      dispatchEffects(editor, [
        toggleSearchPanel.of(true),
        toggleReplaceMode.of(true),
        focusSearchInput.of(),
      ]),
  });

  plugin.addCommand({
    id: "search-next",
    name: "Search next match",
    editorCallback: (editor: Editor) => {
      const view = (editor as EditorWithCodeMirror).cm;
      if (view)
        new SearchHandler(view, plugin.app, plugin.settings, matcher).navigate(
          1,
        );
    },
  });

  plugin.addCommand({
    id: "search-previous",
    name: "Search previous match",
    editorCallback: (editor: Editor) => {
      const view = (editor as EditorWithCodeMirror).cm;
      if (view)
        new SearchHandler(view, plugin.app, plugin.settings, matcher).navigate(
          -1,
        );
    },
  });
}
