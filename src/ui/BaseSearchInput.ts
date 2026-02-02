import { BaseComponent, ExtraButtonComponent, TextComponent } from "obsidian";
import { ToggleButtonComponent } from "./components";

export class BaseSearchInput extends BaseComponent {
  protected input: TextComponent;
  protected buttonsContainer: HTMLDivElement;

  constructor(
    protected container: HTMLElement,
    protected placeholder: string,
    protected cls?: string,
  ) {
    super();
    this.setupUI();
  }

  protected setupUI(): void {
    const inputWrapper = this.container.createDiv({
      cls: ["search-input-container", this.cls].filter(Boolean) as string[],
    });

    this.input = new TextComponent(inputWrapper).setPlaceholder(
      this.placeholder,
    );

    this.buttonsContainer = this.container.createDiv({
      cls: "document-search-buttons",
    });
  }

  addBtn(icon: string, tooltip: string, onClick: () => void): this {
    new ExtraButtonComponent(this.buttonsContainer)
      .setIcon(icon)
      .setTooltip(tooltip)
      .onClick(onClick);
    return this;
  }

  addToggle(
    icon: string,
    tooltip: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ): ToggleButtonComponent {
    return new ToggleButtonComponent(this.buttonsContainer)
      .setIcon(icon)
      .setTooltip(tooltip)
      .setValue(value)
      .onChange(onChange);
  }

  onChange(callback: (value: string) => void): this {
    this.input.onChange(callback);
    return this;
  }

  setValue(value: string): this {
    if (this.input.getValue() !== value) this.input.setValue(value);
    return this;
  }

  focus(): this {
    this.input.inputEl.focus();
    this.input.inputEl.select();
    return this;
  }

  getValue(): string {
    return this.input.getValue();
  }

  getEl(): HTMLInputElement {
    return this.input.inputEl;
  }
}
