import { expect, Locator, Page } from '@playwright/test';

export type FilterGroup = 'Type' | 'Price' | 'Size' | 'Color';

export interface DisplayedProduct {
  name: string;
  price: number | null;
  displayedAttributes: Partial<Record<FilterGroup, string>>;
}

export class QaAutomationLabsFilterPage {
  readonly productList: Locator;
  readonly productCards: Locator;
  readonly emptyState: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh phần tử chứa product link cũng chứa giá và thuộc tính.
    // Reuse product-link locator established by QaAutomationLabsProductPage.
    this.productCards = page.locator('a[href^="product.php"]');
    this.productList = this.productCards;
    // TODO: Xác minh nội dung thông báo trạng thái rỗng trên site thật.
    this.emptyState = page.getByText(/no products|no results|nothing found/i);
  }

  private filterGroup(group: FilterGroup): Locator {
    // TODO: Xác minh tiêu đề nhóm lọc giữ accessible name "Filter by ...".
    return this.page.getByRole('heading', { name: new RegExp(`^Filter by ${group}$`, 'i') });
  }

  async expectDefaultFilters(): Promise<void> {
    for (const groupName of ['Type', 'Price', 'Size', 'Color'] as const) {
      const group = this.filterGroup(groupName);
      await expect(
        group,
        `Nhóm lọc ${groupName} phải hiển thị trên trang Men's Wear.`,
      ).toHaveCount(1);
    }

    // TODO: Nếu site chuyển một nhóm lọc sang dropdown, kiểm tra trạng thái mặc định của dropdown.
    const checkedControls = await this.page
      .getByRole('checkbox')
      .or(this.page.getByRole('radio'))
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            if (element instanceof HTMLInputElement) {
              return element.checked;
            }
            return element.getAttribute('aria-checked') === 'true';
          }),
      );
    expect(
      checkedControls,
      'Tất cả checkbox/radio của các nhóm lọc phải chưa được chọn lúc bắt đầu.',
    ).toHaveLength(0);
  }

  async selectFilterOption(groupName: FilterGroup, optionName: string): Promise<void> {
    await expect(this.filterGroup(groupName), `Tiêu đề nhóm ${groupName} phải hiển thị.`).toHaveCount(1);
    // TODO: Xác minh các nhóm tiếp tục dùng checkbox; hiện chọn theo nhãn accessible.
    const checkbox = this.page.getByRole('checkbox', { name: optionName, exact: true });
    const radio = this.page.getByRole('radio', { name: optionName, exact: true });
    const optionLabel = this.page.getByText(optionName, { exact: true });

    if (await checkbox.count()) {
      if (!(await checkbox.isChecked())) {
        await optionLabel.click();
      }
    } else if (await radio.count()) {
      if (!(await radio.isChecked())) {
        await optionLabel.click();
      }
    } else {
      const dropdowns = this.page.getByRole('combobox');
      let matchingDropdown: Locator | undefined;
      for (let index = 0; index < (await dropdowns.count()); index += 1) {
        const candidate = dropdowns.nth(index);
        if (await candidate.getByRole('option', { name: optionName, exact: true }).count()) {
          matchingDropdown = candidate;
          break;
        }
      }
      if (!matchingDropdown) {
        throw new Error(
          `Nhóm ${groupName} phải có checkbox, radio hoặc dropdown cho tùy chọn "${optionName}".`,
        );
      }
      await matchingDropdown.selectOption({ label: optionName });
    }

    // TODO: Xác minh site có nút Apply hay không; nếu có, áp dụng sau mỗi lựa chọn.
    const applyButton = this.page.getByRole('button', { name: 'Apply', exact: true });
    if (await applyButton.count()) {
      await applyButton.click();
    }

    await expect
      .poll(
        async () => {
          if (await checkbox.count()) {
            return checkbox.isChecked();
          }
          if (await radio.count()) {
            return radio.isChecked();
          }
          const dropdowns = this.page.getByRole('combobox');
          for (let index = 0; index < (await dropdowns.count()); index += 1) {
            const candidate = dropdowns.nth(index);
            if (await candidate.getByRole('option', { name: optionName, exact: true }).count()) {
              return dropdownHasSelectedLabel(candidate, optionName);
            }
          }
          return false;
        },
        { message: `Tùy chọn "${optionName}" của nhóm ${groupName} phải được chọn.` },
      )
      .toBe(true);
  }

  async deselectFilterOption(groupName: FilterGroup, optionName: string): Promise<void> {
    await expect(this.filterGroup(groupName), `Tiêu đề nhóm ${groupName} phải hiển thị.`).toHaveCount(1);
    const checkbox = this.page.getByRole('checkbox', { name: optionName, exact: true });
    const optionLabel = this.page.getByText(optionName, { exact: true });

    if (await checkbox.count()) {
      if (await checkbox.isChecked()) {
        await optionLabel.click();
      }
      await expect
        .poll(() => checkbox.isChecked(), {
          message: `Tùy chọn "${optionName}" của nhóm ${groupName} phải được bỏ chọn.`,
        })
        .toBe(false);
    }
  }

  async unselectFilterOption(groupName: FilterGroup, optionName: string): Promise<void> {
    return this.deselectFilterOption(groupName, optionName);
  }

  async readProducts(): Promise<DisplayedProduct[]> {
    const productCount = await this.productCards.count();
    const products: DisplayedProduct[] = [];

    for (let index = 0; index < productCount; index += 1) {
      const productLink = this.productCards.nth(index);
      // TODO: Xác minh metadata của sản phẩm tiếp tục nằm trong parent của link tên.
      const card = productLink.locator('..');
      const text = (await card.innerText()).trim();
      const name = (await productLink.innerText()).trim();
      const priceText = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/)?.[1];
      const displayedAttributes: DisplayedProduct['displayedAttributes'] = {};

      for (const attribute of ['Price', 'Size', 'Color'] as const) {
        const match = text.match(
          new RegExp(`\\b${attribute}\\s*:\\s*([^|\\r\\n]+?)(?=\\s+Men\\s*-|$)`, 'i'),
        );
        if (match) {
          displayedAttributes[attribute] = match[1].trim();
        }
      }
      const typeMatch = text.match(/\bMen\s*-\s*([^\r\n]+)/i);
      if (typeMatch) {
        displayedAttributes.Type = typeMatch[1].trim();
      }

      products.push({
        name,
        price: priceText ? Number(priceText.replaceAll(',', '')) : null,
        displayedAttributes,
      });
    }

    return products;
  }

  async waitForProductListToSettle(): Promise<void> {
    // Poll until consecutive reads match; the list may legitimately stay unchanged after a filter.
    let previousSnapshot = '';
    await expect
      .poll(
        async () => {
          const currentSnapshot = JSON.stringify(await this.readProducts());
          const isStable = currentSnapshot === previousSnapshot;
          previousSnapshot = currentSnapshot;
          return isStable;
        },
        { message: 'Danh sách sản phẩm phải cập nhật và ổn định sau khi chọn bộ lọc.' },
      )
      .toBe(true);
  }

  async expectEmptyResults(): Promise<void> {
    await expect(
      this.productList,
      'Kết quả rỗng phải không còn sản phẩm hiển thị.',
    ).toHaveCount(0);
    // TODO: Xác minh nội dung thông báo trạng thái rỗng thực tế trên site.
    if (await this.emptyState.count()) {
      await expect(this.emptyState).toBeVisible();
    }
  }
}

async function dropdownHasSelectedLabel(dropdown: Locator, optionName: string): Promise<boolean> {
  return dropdown.evaluate((element, expectedLabel) => {
    if (!(element instanceof HTMLSelectElement)) {
      return element.getAttribute('aria-valuetext') === expectedLabel;
    }
    return element.selectedOptions.item(0)?.textContent?.trim() === expectedLabel;
  }, optionName);
}
