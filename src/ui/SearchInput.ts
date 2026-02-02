import { BaseSearchInput } from "./BaseSearchInput";

export class SearchInput extends BaseSearchInput {
  private searchCount: HTMLDivElement;

  constructor(container: HTMLElement, placeholder: string) {
    super(container, placeholder, "document-search-input");
    this.container.classList.add("document-search");
  }

  protected setupUI(): void {
    super.setupUI();
    this.searchCount = (
      this.input.inputEl.parentElement as HTMLDivElement
    ).createDiv("document-search-count");
    this.searchCount.textContent = "0 / 0";
  }

  updateSearchCount(current: number, total: number): this {
    this.searchCount.textContent =
      total > 0 ? `${current + 1} / ${total}` : "0 / 0";
    return this;
  }
}
