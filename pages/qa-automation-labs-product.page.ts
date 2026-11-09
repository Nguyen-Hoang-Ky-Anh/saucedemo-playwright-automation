import { expect, Locator, Page } from '@playwright/test';

export class QaAutomationLabsProductPage {
  readonly productList: Locator;
  readonly productNames: Locator;
  readonly sortDropdown: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh href product.php vẫn là cách phân biệt product links trên site thật.
    this.productList = page.locator('a[href^="product.php"]');
    this.productNames = this.productList;
    this.sortDropdown = page.getByRole('combobox', { name: /sort/i });
  }

  async openCategory(categoryLinkName: RegExp): Promise<void> {
    // TODO: Xác minh nhãn link danh mục trên site thật; dùng link thay vì đoán URL.
    await this.page.getByRole('link', { name: categoryLinkName }).click();
  }

  async getAllProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async getSelectedSortOption(): Promise<{ value: string; label: string }> {
    return this.sortDropdown.evaluate((element) => {
      if (!(element instanceof HTMLSelectElement)) {
        throw new Error('Sort control is not a native select element.');
      }

      const selectedOption = element.selectedOptions.item(0);
      if (!selectedOption) {
        throw new Error('Sort control has no selected option.');
      }

      return {
        value: element.value,
        label: selectedOption.textContent?.trim() ?? '',
      };
    });
  }

  async selectSortByName(ascending: boolean): Promise<void> {
    // TODO: Xác minh nhãn tùy chọn sắp xếp thực tế trên site.
    const optionName = ascending
      ? /name\W*a\W+to\W+z/i
      : /name\W*z\W+to\W+a/i;
    const option = this.sortDropdown.getByRole('option', { name: optionName });
    await expect(option, 'Phải tìm thấy đúng một tùy chọn sắp xếp theo tên.').toHaveCount(1);

    const value = await option.getAttribute('value');
    if (value === null) {
      throw new Error('Sort option does not have a value.');
    }

    await this.sortDropdown.selectOption(value);
  }
}
