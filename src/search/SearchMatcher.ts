import { SearchOptions } from "../state";

export interface MatchResult {
  start: number;
  end: number;
  text: string;
  groups?: string[];
}

export class SearchMatcher {
  private regex: RegExp | null = null;
  private lastQuery: string = "";
  private lastOptions: SearchOptions = {
    caseSensitive: false,
    wholeWord: false,
    useRegex: true,
  };

  constructor(private query: string = "") {
    this.updateRegex(query);
  }

  updateRegex(
    query: string,
    options: SearchOptions = {
      caseSensitive: false,
      wholeWord: false,
      useRegex: true,
    },
  ): void {
    this.lastQuery = query;
    this.lastOptions = options;

    if (!query) {
      this.regex = null;
      return;
    }

    try {
      let pattern = query;
      let flags = "g";

      if (!options.caseSensitive) {
        flags += "i";
      }

      if (!options.useRegex) {
        // Escape special regex characters for literal search
        pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }

      if (options.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }

      this.regex = new RegExp(pattern, flags);
    } catch {
      this.regex = null;
    }
  }

  isValid(): boolean {
    return this.regex !== null;
  }

  findMatches(text: string): MatchResult[] {
    if (!this.regex || !this.lastQuery) return [];

    const matches: MatchResult[] = [];
    let match;

    this.regex.lastIndex = 0;
    while ((match = this.regex.exec(text)) !== null) {
      if (match[0].length === 0) break;
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        groups: match.slice(1), // Capture groups for replacement
      });
    }

    return matches;
  }

  getMatchCount(text: string): number {
    return this.findMatches(text).length;
  }

  replaceMatches(text: string, replacement: string): string {
    if (!this.regex || !this.lastQuery) return text;

    try {
      return text.replace(this.regex, replacement);
    } catch {
      // Fallback to simple string replacement if regex replacement fails
      if (this.lastOptions.useRegex) {
        return text.split(this.lastQuery).join(replacement);
      } else {
        return text.replace(
          new RegExp(
            this.lastQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g",
          ),
          replacement,
        );
      }
    }
  }

  replaceSingleMatch(
    text: string,
    replacement: string,
    matchIndex: number,
  ): { result: string; replaced: boolean } {
    const matches = this.findMatches(text);
    const match = matches[matchIndex];
    if (!match) return { result: text, replaced: false };

    try {
      const singleRegex = new RegExp(
        this.regex!.source,
        this.regex!.flags.replace("g", ""),
      );
      const replacementText = match.text.replace(singleRegex, replacement);
      return {
        result:
          text.slice(0, match.start) + replacementText + text.slice(match.end),
        replaced: true,
      };
    } catch {
      return { result: text, replaced: false };
    }
  }

  getLastOptions(): SearchOptions {
    return { ...this.lastOptions };
  }
}
