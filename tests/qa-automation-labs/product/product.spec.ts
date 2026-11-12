import { expect, test } from '@playwright/test';
import { QaAutomationLabsProductPage } from '../../../pages/qa-automation-labs-product.page';
import { loginAsDemo } from './product-auth.helper';

const PRODUCT_CATEGORY = {
  slug: 'mens-wear',
  // TODO: Xác minh lại nhãn này trên site thật.
  linkName: /shop\s+men\s+fashion/i,
};

type SortDirection = 'ascending' | 'descending';

async function readProductNames(productPage: QaAutomationLabsProductPage): Promise<string[]> {
  return (await productPage.getAllProductNames()).map((name) => name.trim());
}

function assertProductOrder(names: string[], direction: SortDirection): void {
  // TODO: Xác minh site có phân biệt chữ hoa/thường khi sắp xếp tên.
  const expectedNames = [...names].sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' }),
  );
  if (direction === 'descending') {
    expectedNames.reverse();
  }

  const message =
    direction === 'ascending'
      ? 'Tên sản phẩm phải được sắp xếp tăng dần từ A đến Z.'
      : 'Tên sản phẩm phải được sắp xếp giảm dần từ Z đến A.';
  expect(names, message).toEqual(expectedNames);
}

test.describe('Product', () => {
  let productPage: QaAutomationLabsProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new QaAutomationLabsProductPage(page);
    await loginAsDemo(page);
    await productPage.openCategory(PRODUCT_CATEGORY.linkName);

    await expect(productPage.productList.first()).toBeVisible();
    const productNames = await readProductNames(productPage);
    expect(
      productNames.length,
      `Danh mục "${PRODUCT_CATEGORY.slug}" phải có từ 2 sản phẩm trở lên; hiện có ${productNames.length}.`,
    ).toBeGreaterThanOrEqual(2);

    await expect(productPage.sortDropdown, 'Danh sách sắp xếp phải hiển thị và sử dụng được.').toBeVisible();
    await expect(productPage.sortDropdown).toBeEnabled();
    const defaultSort = await productPage.getSelectedSortOption();
    expect(defaultSort.label, 'Danh sách sắp xếp phải có giá trị mặc định được chọn.').not.toBe('');
    test.info().annotations.push({
      type: 'Giá trị sắp xếp mặc định',
      description: `${defaultSort.label} (${defaultSort.value})`,
    });
  });

  // Ưu tiên P2, kỹ thuật EP.
  test('PR-06: Kiểm tra sắp xếp sản phẩm theo tên từ A đến Z', async () => {
    let initialNames: string[] = [];
    let initialCount = 0;
    let sortedNames: string[] = [];

    await test.step('1) Ghi lại thứ tự và số lượng sản phẩm đang hiển thị.', async () => {
      initialNames = await readProductNames(productPage);
      initialCount = initialNames.length;
    });

    await test.step('2) Mở danh sách sắp xếp, chọn sắp xếp theo tên A–Z.', async () => {
      await productPage.selectSortByName(true);
    });

    await test.step('3) Đọc tên các sản phẩm từ trên xuống dưới.', async () => {
      sortedNames = await readProductNames(productPage);
    });

    assertProductOrder(sortedNames, 'ascending');
    expect(
      sortedNames.length,
      'Số lượng sản phẩm sau khi sắp xếp A–Z phải bằng số lượng đã ghi ở bước 1.',
    ).toBe(initialCount);
  });

  // Ưu tiên P2, kỹ thuật EP.
  test('PR-07: Kiểm tra sắp xếp sản phẩm theo tên từ Z đến A', async () => {
    let initialNames: string[] = [];
    let initialCount = 0;
    let sortedNames: string[] = [];

    await test.step('1) Ghi lại thứ tự và số lượng sản phẩm đang hiển thị.', async () => {
      initialNames = await readProductNames(productPage);
      initialCount = initialNames.length;
    });

    await test.step('2) Mở danh sách sắp xếp, chọn sắp xếp theo tên Z–A.', async () => {
      await productPage.selectSortByName(false);
    });

    await test.step('3) Đọc tên các sản phẩm từ trên xuống dưới.', async () => {
      sortedNames = await readProductNames(productPage);
    });

    assertProductOrder(sortedNames, 'descending');
    expect(
      sortedNames.length,
      'Số lượng sản phẩm sau khi sắp xếp Z–A phải bằng số lượng đã ghi ở bước 1.',
    ).toBe(initialCount);
  });

  test('PR-05: Kiểm tra sắp xếp sản phẩm theo giá từ cao đến thấp', async () => {
    let initialCount = 0;
    let sortedPrices: number[] = [];

    await test.step('1) Ghi lại số lượng sản phẩm đang hiển thị', async () => {
      initialCount = await productPage.productList.count();
    });

    await test.step('2) Mở danh sách sắp xếp, chọn sắp xếp theo giá từ cao đến thấp', async () => {
      const option = productPage.sortDropdown.getByRole('option', {
        name: /price\W*high\W+to\W+low/i,
      });
      await expect(option, 'Phải tìm thấy tùy chọn sắp xếp giá cao đến thấp').toHaveCount(1);
      const value = await option.getAttribute('value');
      expect(value).not.toBeNull();
      await productPage.sortDropdown.selectOption(value!);
    });

    await test.step('3) Đọc giá các sản phẩm từ trên xuống dưới', async () => {
      const count = await productPage.productList.count();
      sortedPrices = [];
      for (let index = 0; index < count; index += 1) {
        const cardText = await productPage.productList.nth(index).locator('..').innerText();
        const match = cardText.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
        expect(match, `Sản phẩm thứ ${index + 1} phải hiển thị giá`).not.toBeNull();
        sortedPrices.push(Number(match![1].replaceAll(',', '')));
      }
    });

    const expectedPrices = [...sortedPrices].sort((left, right) => right - left);
    expect(sortedPrices, 'Giá sản phẩm phải được sắp xếp giảm dần từ cao đến thấp').toEqual(
        expectedPrices,
    );
    expect(
        sortedPrices.length,
        'Số lượng sản phẩm sau khi sắp xếp giá cao đến thấp phải giữ nguyên',
    ).toBe(initialCount);
  });

  test('PR-08: Kiểm tra danh sách sắp xếp có 4 lựa chọn và ghi nhận giá trị mặc định', async () => {
    await test.step('1) Quan sát và ghi nhận giá trị mặc định của danh sách sắp xếp', async () => {
      const defaultSort = await productPage.getSelectedSortOption();
      expect(defaultSort.label, 'Danh sách sắp xếp phải có giá trị mặc định').not.toBe('');
    });

    await test.step('2) Mở danh sách sắp xếp và kiểm tra đủ 4 lựa chọn.', async () => {
      const options = productPage.sortDropdown.getByRole('option');
      const optionLabels = (await options.allTextContents()).map((text) => text.trim());
      const sortChoiceLabels = optionLabels.filter((text) => !/^sort\s+by$/i.test(text));

      expect(sortChoiceLabels, 'Danh sách sắp xếp phải có đúng 4 lựa chọn sắp xếp.').toHaveLength(4);
      expect(optionLabels.some((text) => /name\W*a\W+to\W+z/i.test(text))).toBe(true);
      expect(optionLabels.some((text) => /name\W*z\W+to\W+a/i.test(text))).toBe(true);
      expect(optionLabels.some((text) => /price\W*low\W+to\W+high/i.test(text))).toBe(true);
      expect(optionLabels.some((text) => /price\W*high\W+to\W+low/i.test(text))).toBe(true);
    });
  });
});