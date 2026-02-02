# Search and Replace with Regex

A powerful search and replace plugin for Obsidian with full regular expression support.

## Features

- **Search**: Search your notes with regular expressions, plain text, or whole word matching
- **Replace**: Replace single or all occurrences with support for regex capture groups
- **Search Options**:
  - Case sensitive matching
  - Whole word matching
  - Regular expression mode (or plain text mode)
- **Navigation**: Jump between matches with keyboard shortcuts or buttons
- **Search History**: Access your recent searches and replacements
- **Match Counter**: See which match you're on (e.g., "3 / 12")
- **Persistent Settings**: Your default search preferences are saved

## Installation

1. Download the plugin files (`main.js`, `manifest.json`, `styles.css`)
2. Place them in your vault: `.obsidian/plugins/obsidian-search-replace-regex/`
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Usage

### Quick Start

Press <kbd>Ctrl/Cmd</kbd> + <kbd>F</kbd> (or use the command palette) to open the Search panel:

- Type your search query (regex or plain text)
- Use the toggle buttons to customize your search:
  - **Case sensitive**: Match letter casing
  - **Whole word**: Match only complete words
  - **Use regex**: Enable regular expression mode
- Navigate matches with **↑** and **↓** buttons or press <kbd>F3</kbd> for next

### Replace

Press <kbd>Ctrl/Cmd</kbd> + <kbd>H</kbd> to open Search & Replace:

- Enter your search query and replacement text
- Click **Replace & Search** to replace one occurrence and move to the next
- Click **Replace All** to replace all matches at once
- Regex capture groups (like `$1`, `$2`) work in replacements

### Keyboard Shortcuts

| Action         | Shortcut                                              |
| -------------- | ----------------------------------------------------- |
| Search         | <kbd>Ctrl/Cmd</kbd> + <kbd>F</kbd>                    |
| Replace        | <kbd>Ctrl/Cmd</kbd> + <kbd>H</kbd>                    |
| Next match     | <kbd>F3</kbd> or <kbd>Enter</kbd>                     |
| Previous match | <kbd>Shift</kbd> + <kbd>F3</kbd>                      |
| Replace single | <kbd>Ctrl/Cmd</kbd> + <kbd>Enter</kbd>                |
| Replace all    | <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> |
| History        | <kbd>Ctrl/Cmd</kbd> + <kbd>↓</kbd>                    |
| Exit search    | <kbd>Esc</kbd>                                        |

### Search History

Access previous searches with:

- **Arrow keys** in the search field to cycle through history
- **History button** or <kbd>Ctrl/Cmd</kbd> + <kbd>↓</kbd> to browse all past searches
- Click the trash icon to delete individual history entries

### Settings

Configure default search options in **Settings → Search and Replace with Regex**:

- Set default case sensitivity
- Enable whole word matching by default
- Enable regex mode by default
- Adjust maximum history items (5-50)

## Examples

### Search email addresses

```
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
```

### Search and replace dates

Search: `(\d{4})-(\d{2})-(\d{2})`  
Replace: `$3/$2/$1`

### Remove duplicate words

Search: `\b(\w+)\s+\1\b`  
Replace: `$1`

## Development

### Setup

```bash
npm i
```

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm format
```

## License

[0-BSD License](LICENSE)
