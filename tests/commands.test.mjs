/* eslint obsidianmd/no-plugin-as-component: off */
import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { registerCommands } = jiti("../src/commands.ts");
const { setSearchOptions } = jiti("../src/state.ts");

for (const commandId of ["open-regex-search", "open-regex-replace"]) {
  test(`${commandId} applies configured default search options`, () => {
    const defaultSearchOptions = {
      caseSensitive: true,
      wholeWord: true,
      useRegex: false,
    };
    const commands = [];

    registerCommands({
      settings: { defaultSearchOptions },
      app: {},
      addCommand: (command) => commands.push(command),
    });

    const effects = [];
    const command = commands.find(({ id }) => id === commandId);
    command.editorCallback({
      cm: {
        dispatch: (transaction) => effects.push(...transaction.effects),
      },
    });

    const optionEffects = effects.filter((effect) =>
      effect.is(setSearchOptions),
    );
    assert.equal(optionEffects.length, 1);
    assert.deepEqual(optionEffects[0].value, defaultSearchOptions);
  });
}
