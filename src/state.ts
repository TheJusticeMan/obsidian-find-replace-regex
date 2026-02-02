import {
  EditorState,
  StateEffect,
  StateEffectType,
  StateField,
  Transaction,
} from "@codemirror/state";

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  caseSensitive: false,
  wholeWord: false,
  useRegex: true,
};

export const getSearchQuery = (state: EditorState) =>
  state.field(searchQueryField);
export const getReplaceQuery = (state: EditorState) =>
  state.field(replaceQueryField);
export const getSearchOptions = (state: EditorState) =>
  state.field(searchOptionsField);
export const getMatchIndex = (state: EditorState) =>
  state.field(matchIndexField);
export const isSearchPanelOpen = (state: EditorState) =>
  state.field(searchPanelOpenField);
export const isReplaceMode = (state: EditorState) =>
  state.field(replaceModeField);

export const compareOptions = (o1: SearchOptions, o2: SearchOptions) =>
  o1.caseSensitive === o2.caseSensitive &&
  o1.wholeWord === o2.wholeWord &&
  o1.useRegex === o2.useRegex;

export const toggleSearchPanel = StateEffect.define<boolean>();
export const toggleReplaceMode = StateEffect.define<boolean>();
export const focusSearchInput = StateEffect.define<void>();
export const setSearchQuery = StateEffect.define<string>();
export const setReplaceQuery = StateEffect.define<string>();
export const setSearchOptions = StateEffect.define<SearchOptions>();
export const setMatchIndex = StateEffect.define<number>();

const updateField = <T>(
  value: T,
  tr: Transaction,
  effectType: StateEffectType<T>,
): T => {
  for (const e of tr.effects) if (e.is(effectType)) value = e.value;
  return value;
};

export const searchPanelOpenField = StateField.define<boolean>({
  create: () => false,
  update: (v, tr) => updateField(v, tr, toggleSearchPanel),
});

export const replaceModeField = StateField.define<boolean>({
  create: () => false,
  update: (v, tr) => updateField(v, tr, toggleReplaceMode),
});

export const searchQueryField = StateField.define<string>({
  create: () => "",
  update: (v, tr) => updateField(v, tr, setSearchQuery),
});

export const replaceQueryField = StateField.define<string>({
  create: () => "",
  update: (v, tr) => updateField(v, tr, setReplaceQuery),
});

export const searchOptionsField = StateField.define<SearchOptions>({
  create: () => DEFAULT_SEARCH_OPTIONS,
  update: (v, tr) => updateField(v, tr, setSearchOptions),
});

export const matchIndexField = StateField.define<number>({
  create: () => 0,
  update: (v, tr) => updateField(v, tr, setMatchIndex),
});
