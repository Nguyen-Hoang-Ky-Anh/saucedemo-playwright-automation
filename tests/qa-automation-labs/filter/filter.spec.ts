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

const PRICE_RANGES = [
  '$0 - $100',
  '$101 - $200',
  '$201 - $300',
  '$301 - $400',
  '$401 - $500',
] as const;

const SIZES = [
  'Small',
  'Medium',
  'Large',
  'Extra Large',
  'Double Extra Large',
] as const;

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

  test('FL-01: Lọc theo Type (Formal, Footwear) ở Men\'s Wear', async () => {
    test.setTimeout(60000);
    let initialCount = 0;

    await test.step('Ghi nhận tổng số sản phẩm đang hiển thị', async () => {
      initialCount = initialSnapshot.count;
      expect(initialCount, 'Số lượng sản phẩm ban đầu phải lớn hơn 0.').toBeGreaterThan(0);
    });

    await test.step('Tại "Filter by Type", chọn "Formal" và quan sát danh sách', async () => {
      await filterPage.selectFilterOption('Type', 'Formal');
      await filterPage.waitForProductListToSettle();
      const formalProducts = await filterPage.readProducts();

      expect(formalProducts.length, 'Phải có sản phẩm thuộc loại Formal hiển thị.').toBeGreaterThan(0);
      for (const product of formalProducts) {
        expect(
          product.displayedAttributes.Type?.toLowerCase(),
          `Sản phẩm "${product.name}" phải thuộc loại Formal.`,
        ).toBe('formal');
      }
    });

    await test.step('Bỏ chọn "Formal"; chọn "Footwear" và quan sát danh sách', async () => {
      await filterPage.unselectFilterOption('Type', 'Formal');
      await filterPage.selectFilterOption('Type', 'Footwear');
      await filterPage.waitForProductListToSettle();
      const footwearProducts = await filterPage.readProducts();

      if (footwearProducts.length > 0) {
        for (const product of footwearProducts) {
          expect(
            product.displayedAttributes.Type?.toLowerCase(),
            `Sản phẩm "${product.name}" phải thuộc loại Footwear.`,
          ).toBe('footwear');
        }
      } else {
        await filterPage.expectEmptyResults();
      }
    });

    await test.step('Bỏ chọn "Footwear" và quan sát danh sách', async () => {
      await filterPage.unselectFilterOption('Type', 'Footwear');
      await filterPage.waitForProductListToSettle();
      const resetProducts = await filterPage.readProducts();
      const resetSnapshot = snapshotProducts(resetProducts);

      expect(
        resetSnapshot.count,
        'Số lượng sản phẩm sau khi bỏ chọn bộ lọc phải trở về đầy đủ như ban đầu.',
      ).toBe(initialCount);
      expect(
        resetSnapshot.names,
        'Danh sách tên sản phẩm phải trở về đầy đủ như ban đầu.',
      ).toEqual(initialSnapshot.names);
    });
  });

  // Ưu tiên P2, BVA.
  test('FL-02: Kiểm tra lọc theo từng khoảng giá ($0-100 ... $401-500)', async () => {
    for (const priceLabel of PRICE_RANGES) {
      const range = parsePriceRange(priceLabel);
      let filteredProducts: DisplayedProduct[] = [];

      await test.step(`1) Chọn khoảng giá "${priceLabel}".`, async () => {
        await filterPage.selectFilterOption('Price', priceLabel);
        await filterPage.waitForProductListToSettle();
        filteredProducts = await filterPage.readProducts();
      });

      await test.step(`2) Đối chiếu giá bán của các sản phẩm hiển thị với khoảng "${priceLabel}".`, async () => {
        assertSnapshotOnlyNarrows(
          initialSnapshot,
          snapshotProducts(filteredProducts),
          `Lọc theo Price ${priceLabel}`,
        );

        if (filteredProducts.length === 0) {
          await filterPage.expectEmptyResults();
        } else {
          for (const [index, product] of filteredProducts.entries()) {
            expect(product.name, `Sản phẩm kết quả #${index + 1} phải có tên hiển thị`).not.toBe('');
            expect(product.price, `Giá của "${product.name}" phải đọc được`).not.toBeNull();
            expect(
              product.price!,
              `Giá của "${product.name}" phải >= ${range.minimum}.`,
            ).toBeGreaterThanOrEqual(range.minimum);
            expect(
              product.price!,
              `Giá của "${product.name}" phải <= ${range.maximum}.`,
            ).toBeLessThanOrEqual(range.maximum);
          }
        }
      });

      await filterPage.deselectFilterOption('Price', priceLabel);
      await filterPage.waitForProductListToSettle();
    }
  });

  // Ưu tiên P2, EP.
  test('FL-03: Kiểm tra lọc theo Size (Small ... Double Extra Large)', async () => {
    for (const sizeLabel of SIZES) {
      let filteredProducts: DisplayedProduct[] = [];

      await test.step(`1) Chọn kích thước "${sizeLabel}".`, async () => {
        await filterPage.selectFilterOption('Size', sizeLabel);
        await filterPage.waitForProductListToSettle();
        filteredProducts = await filterPage.readProducts();
      });

      await test.step(`2) Đối chiếu thuộc tính Size của các sản phẩm hiển thị với "${sizeLabel}".`, async () => {
        assertSnapshotOnlyNarrows(
          initialSnapshot,
          snapshotProducts(filteredProducts),
          `Lọc theo Size ${sizeLabel}`,
        );

        if (filteredProducts.length === 0) {
          await filterPage.expectEmptyResults();
        } else {
          for (const [index, product] of filteredProducts.entries()) {
            expect(product.name, `Sản phẩm kết quả #${index + 1} phải có tên hiển thị`).not.toBe('');
            const displayedSize = product.displayedAttributes.Size;
            if (displayedSize !== undefined) {
              expect(
                displayedSize.toLowerCase(),
                `Size của "${product.name}" phải bằng "${sizeLabel}".`,
              ).toBe(sizeLabel.toLowerCase());
            } else {
              test.info().annotations.push({
                type: 'Không kiểm chứng được trên giao diện',
                description: `không kiểm chứng được thuộc tính Size "${sizeLabel}" trên giao diện`,
              });
            }
          }
        }
      });

      await filterPage.deselectFilterOption('Size', sizeLabel);
      await filterPage.waitForProductListToSettle();
    }
  });

  test('FL-04: Kiểm tra lọc sản phẩm theo Color', async () => {
    let filteredProducts: DisplayedProduct[] = [];

    await test.step('1) Chọn bộ lọc Color "Black".', async () => {
      await filterPage.selectFilterOption('Color', FILTERS.color);
      await filterPage.waitForProductListToSettle();
      filteredProducts = await filterPage.readProducts();
    });

    await test.step('2) Đối chiếu các sản phẩm hiển thị với màu đã chọn', async () => {
      assertSnapshotOnlyNarrows(
          initialSnapshot,
          snapshotProducts(filteredProducts),
          'Lọc theo Color Black',
      );

      for (const [index, product] of filteredProducts.entries()) {
        expect(product.name, `Sản phẩm kết quả #${index + 1} phải có tên hiển thị`).not.toBe('');
        const displayedColor = product.displayedAttributes.Color;
        if (displayedColor !== undefined) {
          expect(
              displayedColor.toLowerCase(),
              `Color của "${product.name}" phải bằng "${FILTERS.color}".`,
          ).toBe(FILTERS.color.toLowerCase());
        } else {
          test.info().annotations.push({
            type: 'Không kiểm chứng được trên giao diện',
            description: 'không kiểm chứng được thuộc tính Color trên giao diện',
          });
        }
      }

      if (filteredProducts.length === 0) {
        await filterPage.expectEmptyResults();
      }
    });
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

  test('FL-06: Kiểm tra kết hợp lọc và sắp xếp', async ({ page }) => {
    const productPage = new QaAutomationLabsProductPage(page);
    let filteredSnapshot: ProductSnapshot;
    let finalProducts: DisplayedProduct[] = [];

    await test.step('1) Chọn bộ lọc Color "Black".', async () => {
      await filterPage.selectFilterOption('Color', FILTERS.color);
      await filterPage.waitForProductListToSettle();
      const productsAfterFilter = await filterPage.readProducts();
      filteredSnapshot = snapshotProducts(productsAfterFilter);
      assertSnapshotOnlyNarrows(initialSnapshot, filteredSnapshot, 'Lọc theo Color Black');
    });

    await test.step('2) Chọn sắp xếp sản phẩm theo tên từ A đến Z', async () => {
      await productPage.selectSortByName(true);
      await filterPage.waitForProductListToSettle();
      finalProducts = await filterPage.readProducts();
    });

    await test.step('3) Kiểm tra kết quả vừa thỏa bộ lọc vừa đúng thứ tự sắp xếp', async () => {
      expect(
          finalProducts.length,
          'Số lượng sản phẩm sau khi sắp xếp phải giữ nguyên so với sau khi lọc',
      ).toBe(filteredSnapshot.count);

      for (const product of finalProducts) {
        const displayedColor = product.displayedAttributes.Color;
        if (displayedColor !== undefined) {
          expect(displayedColor.toLowerCase()).toBe(FILTERS.color.toLowerCase());
        }
      }

      const names = finalProducts.map(({ name }) => name);
      const expectedNames = [...names].sort((left, right) =>
          left.localeCompare(right, undefined, { sensitivity: 'base' }),
      );
      expect(names, 'Kết quả đã lọc phải được sắp xếp theo tên tăng dần từ A đến Z').toEqual(
          expectedNames,
      );
    });
  });
});