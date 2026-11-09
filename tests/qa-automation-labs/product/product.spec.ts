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
});