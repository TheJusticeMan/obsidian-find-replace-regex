import { ExtraButtonComponent } from "obsidian";

export class ToggleButtonComponent extends ExtraButtonComponent {
  private value: boolean;
  private onChangeCallback?: (value: boolean) => void;

  constructor(container: HTMLElement) {
    super(container);
    this.value = false;
    this.onClick(() => {
      this.setValue(!this.value);
      this.onChangeCallback?.(this.value);
    });
  }

  onChange(callback: (value: boolean) => void): this {
    this.onChangeCallback = callback;
    return this;
  }

  setValue(value: boolean): this {
    if (this.value === value) return this;
    this.value = value;
    this.extraSettingsEl.toggleClass("active", value);
    return this;
  }

  getValue(): boolean {
    return this.value;
  }
}
