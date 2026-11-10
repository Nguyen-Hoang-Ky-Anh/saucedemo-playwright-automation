import { expect, test } from '@playwright/test';
import {
  DisplayedProduct,
  FilterGroup,
  QaAutomationLabsFilterPage,
} from '../../../pages/qa-automation-labs-filter.page';
import { QaAutomationLabsProductPage } from '../../../pages/qa-automation-labs-product.page';
import { loginAsDemo } from '../product/product-auth.helper';

const MENS_WEAR_CATEGORY = {
  path: '/mens-wear.php', // TODO: Xác minh path danh mục trên site thật.
  linkName: /shop\s+men\s+fashion/i,
};
const FILTERS = {
  type: 'Formal',
  price: '$101 - $200',
  size: 'Medium',
  color: 'Black',
} as const;

function parsePriceRange(value: string): { minimum: number; maximum: number } {
  const bounds = value.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
  if (!bounds) {
    throw new Error(`Filter price range must contain two numeric bounds: ${value}`);
  }
  return {
    minimum: Number(bounds[1].replaceAll(',', '')),
    maximum: Number(bounds[2].replaceAll(',', '')),
  };
}

const PRICE_RANGE = parsePriceRange(FILTERS.price);

type ProductSnapshot = { names: string[]; count: number };

function snapshotProducts(products: DisplayedProduct[]): ProductSnapshot {
  return {
    names: products.map(({ name }) => name),
    count: products.length,
  };
}

function assertSnapshotOnlyNarrows(
  previous: ProductSnapshot,
  next: ProductSnapshot,
  label: string,
): void {
  const previousNames = new Set(previous.names);
  expect(
    next.names.every((name) => previousNames.has(name)),
    `${label}: tập tên sản phẩm sau khi lọc phải là tập con của snapshot trước.`,
  ).toBe(true);
  expect(
    next.count,
    `${label}: số lượng sản phẩm không được tăng sau khi thêm bộ lọc.`,
  ).toBeLessThanOrEqual(previous.count);
}

test.describe('Filter', () => {
  let filterPage: QaAutomationLabsFilterPage;
  let initialSnapshot: ProductSnapshot;

  test.beforeEach(async ({ page }) => {
    filterPage = new QaAutomationLabsFilterPage(page);
    await loginAsDemo(page);
    const productPage = new QaAutomationLabsProductPage(page);
    await productPage.openCategory(MENS_WEAR_CATEGORY.linkName);
    // TODO: Xác minh link Men's Wear tương ứng với path mens-wear.php trên site thật.
    expect(new URL(page.url()).pathname).toBe(MENS_WEAR_CATEGORY.path);
    await expect(filterPage.productList.first()).toBeVisible();
    await filterPage.expectDefaultFilters();
    initialSnapshot = snapshotProducts(await filterPage.readProducts());
  });

  // Ưu tiên P2, kỹ thuật bảng quyết định.
  test('FL-05: Kiểm tra kết hợp nhiều bộ lọc cùng lúc (Type, giá, size, màu)', async () => {
    const snapshots: ProductSnapshot[] = [initialSnapshot];
    let finalProducts: DisplayedProduct[] = [];

    const filterSteps: Array<{
      group: FilterGroup;
      value: string;
      stepName: string;
    }> = [
      { group: 'Type', value: FILTERS.type, stepName: '1) Chọn Type "Formal".' },
      { group: 'Price', value: FILTERS.price, stepName: '2) Chọn khoảng giá "$101-200".' },
      { group: 'Size', value: FILTERS.size, stepName: '3) Chọn Size "Medium".' },
      { group: 'Color', value: FILTERS.color, stepName: '4) Chọn Color "Black".' },
    ];

    for (const { group, value, stepName } of filterSteps) {
      await test.step(stepName, async () => {
        await filterPage.selectFilterOption(group, value);
        await filterPage.waitForProductListToSettle();
        const products = await filterPage.readProducts();
        snapshots.push(snapshotProducts(products));
        finalProducts = products;
      });
    }

    await test.step('5) Đối chiếu từng sản phẩm kết quả với cả bốn điều kiện đã chọn.', async () => {
      for (const [index, product] of finalProducts.entries()) {
        expect(product.name, `Sản phẩm kết quả #${index + 1} phải có tên hiển thị.`).not.toBe('');

        if (product.price !== null) {
          expect(
            product.price,
            `Giá của "${product.name}" phải nằm trong khoảng $101-200.`,
          ).toBeGreaterThanOrEqual(PRICE_RANGE.minimum);
          expect(
            product.price,
            `Giá của "${product.name}" phải nằm trong khoảng $101-200.`,
          ).toBeLessThanOrEqual(PRICE_RANGE.maximum);
        }

        for (const [group, selectedValue] of [
          ['Type', FILTERS.type],
          ['Size', FILTERS.size],
          ['Color', FILTERS.color],
        ] as const) {
          const displayedValue = product.displayedAttributes[group];
          if (displayedValue !== undefined) {
            expect(
              displayedValue.toLowerCase(),
              `${group} của "${product.name}" phải bằng "${selectedValue}".`,
            ).toBe(selectedValue.toLowerCase());
          } else {
            test.info().annotations.push({
              type: 'Không kiểm chứng được trên giao diện',
              description: `không kiểm chứng được thuộc tính ${group} trên giao diện`,
            });
          }
        }
      }
    });

    for (let index = 1; index < snapshots.length; index += 1) {
      assertSnapshotOnlyNarrows(
        snapshots[index - 1],
        snapshots[index],
        `Lần thêm bộ lọc thứ ${index}`,
      );
    }

    if (finalProducts.length === 0) {
      await filterPage.expectEmptyResults();
    }
  });
});