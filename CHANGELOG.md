# Changelog

## [0.0.4] - 2026-05-16

- Fix the release

## [0.0.3] - 2026-05-16

### Updates

- Updated the readme header

## [0.0.2] - 2026-05-16

### Release Updates

- Bumped the plugin release metadata to `0.0.2`.
- Switched the repository license text to MIT.
- Tightened the TypeScript and lint configuration used by the plugin build.
- Cleaned up search UI and command typings to avoid internal `ts-ignore` usage.

## [0.0.1] - 2026-05-16

### Security and Release Improvements

- Added build artifact attestations to the GitHub release workflow for `main.js`, `manifest.json`, and `styles.css`.
- Updated workflow permissions to support provenance attestations (`id-token: write` and `attestations: write`).
- Release pipeline now emits verifiable provenance metadata for published plugin artifacts.

## [0.0.0] - 2026-02-02

### Initial Release 🎉

Welcome to the first release of the Search and Replace with Regex plugin!

#### ✨ New Features

- **Regex Search & Replace**: Unleash the power of Regular Expressions to search and replace text in your notes.
- **Smart Search Options**:
  - Toggle **Case Sensitivity** for precise matching.
  - Use **Whole Word** search to avoid partial matches.
  - Switch between **Regex** and standard text search modes.
- **Search History**:
  - Automatically saves your recent searches.
  - Quickly recall past queries from the history menu.
- **Navigation & Highlighting**:
  - clear highlighting of all matches in your document.
  - Jump between matches using keyboard shortcuts or on-screen buttons.
  - "Match x of y" counter to keep track of your position.
- **Productivity Shortcuts**:
  - `Ctrl/Cmd + F`: Open Search
  - `Ctrl/Cmd + H`: Open Replace
  - `F3` / `Shift + F3`: Search Next / Previous
