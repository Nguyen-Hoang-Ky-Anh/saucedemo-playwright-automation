import { expect, test } from '@playwright/test';
import { QaAutomationLabsProductPage } from '../../../pages/qa-automation-labs-product.page';
import { loginAsDemo } from './product-auth.helper';

const SHOP_CATEGORIES = [
  { label: 'Men', name: /men\s+fashion/i, href: 'mens-wear.php' },
  { label: 'Women', name: /women\s+fashion/i, href: 'womens-wear.php' },
  { label: 'Kids', name: /kids\s+fashion/i, href: 'kids-wear.php' },
  { label: 'Electronics', name: /electronics/i, href: 'electronics.php' },
];

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

test.describe('Shop Categories', () => {
  // Ưu tiên P1, Theo yêu cầu.
  test('PR-01: Kiểm tra trang Shop hiển thị đủ 4 danh mục', async ({ page }) => {
    await test.step('1) Truy cập vào trang Shop của hệ thống.', async () => {
      await loginAsDemo(page);
      await expect(page, 'Phải đang ở trang Shop (/shop.php).').toHaveURL(/\/shop\.php(?:[?#]|$)/);
    });

    await test.step('2) Quan sát danh sách các danh mục sản phẩm hiển thị trên trang.', async () => {
      await expect(page.locator('.product-offer'), 'Trang Shop phải hiển thị đủ 4 danh mục.').toHaveCount(4);
    });

    await test.step('3) Kiểm tra tên, hình ảnh và liên kết của từng danh mục.', async () => {
      for (const category of SHOP_CATEGORIES) {
        const card = page.locator('.product-offer', {
          has: page.locator(`a[href="${category.href}"]`),
        });
        const link = card.locator(`a[href="${category.href}"]`);
        const image = card.locator('img');

        await expect(card, `Danh mục ${category.label} phải hiển thị.`).toBeVisible();
        await expect(card, `Danh mục ${category.label} phải hiển thị tên rõ ràng.`).toContainText(category.name);
        await expect(image, `Danh mục ${category.label} phải có hình ảnh hiển thị.`).toBeVisible();
        await expect
          .poll(
            () => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
            { message: `Hình ảnh của danh mục ${category.label} phải tải thành công.` },
          )
          .toBe(true);
        await expect(link, `Danh mục ${category.label} phải có liên kết điều hướng hợp lệ.`).toBeVisible();
        await expect(link).toHaveAttribute('href', category.href);
      }
    });
  });
});

test.describe('Product', () => {
  let productPage: QaAutomationLabsProductPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);
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

  test('PR-02: Bấm Shop Now của từng danh mục', async ({ page }) => {
    test.setTimeout(90000);
    // Đang ở trang https://shop.qaautomationlabs.com/shop.php
    await page.goto('/shop.php', { waitUntil: 'domcontentloaded' });
    const categories = [
      {
        name: 'Men Fashion',
        path: /mens-wear\.php/,
        link: page.locator('.product-offer a[href*="mens-wear.php"]').or(page.locator('a[href*="mens-wear.php"]')),
      },
      {
        name: 'Women Fashion',
        path: /womens-wear\.php/,
        link: page.locator('.product-offer a[href*="womens-wear.php"]').or(page.locator('a[href*="womens-wear.php"]')),
      },
      {
        name: 'Kids Fashion',
        path: /kids-wear\.php/,
        link: page.locator('.product-offer a[href*="kids-wear.php"]').or(page.locator('a[href*="kids-wear.php"]')),
      },
      {
        name: 'Electronics',
        path: /electronics\.php/,
        link: page.locator('.product-offer a[href*="electronics.php"]').or(page.locator('a[href*="electronics.php"]')),
      },
    ];
    for (let i = 0; i < categories.length; i += 1) {
      const cat = categories[i];
      await test.step(`${i + 1}) Tại banner "${cat.name}", bấm "Shop Now" và kiểm tra URL, tiêu đề trang`, async () => {
        if (!page.url().includes('shop.php')) {
          await page.goto('/shop.php', { waitUntil: 'domcontentloaded' });
        }
        const shopNowBtn = cat.link.first();
        await expect(shopNowBtn, `Nút Shop Now của banner "${cat.name}" phải hiển thị`).toBeVisible();
        await shopNowBtn.click();

        // Chuyển sang trang danh mục tương ứng
        await expect(page).toHaveURL(cat.path);

        // Danh mục tải thành công, hiển thị sản phẩm
        await expect(productPage.productList.first()).toBeVisible();

        // Quay lại /shop.php nếu chưa phải danh mục cuối
        if (i < categories.length - 1) {
          await page.goto('/shop.php', { waitUntil: 'domcontentloaded' });
        }
      });
    }
  });

  test('PR-03: Trang danh mục hiển thị sản phẩm với tên, giá, nút thêm vào giỏ', async ({ page }) => {
    test.setTimeout(60000);
    const categoryPaths = [
      { name: 'Men Fashion', path: '/mens-wear.php' },
      { name: 'Women Fashion', path: '/womens-wear.php' },
      { name: 'Kids Fashion', path: '/kids-wear.php' },
      { name: 'Electronics Fashion', path: '/electronics.php' },
    ];
    for (const cat of categoryPaths) {
      await test.step(`Kiểm tra danh mục "${cat.name}" (${cat.path})`, async () => {
        if (!page.url().endsWith(cat.path)) {
          await page.goto(cat.path, { waitUntil: 'domcontentloaded' });
        }

        // Mỗi danh mục hiển thị danh sách sản phẩm
        const productCards = page.locator('.product-item');
        const count = await productCards.count();
        expect(count, `Danh mục "${cat.name}" phải có ít nhất 1 sản phẩm`).toBeGreaterThan(0);

        // Kiểm tra toàn bộ sản phẩm trong danh mục: ảnh, tên, giá, nút giỏ hàng
        const items = await productCards.evaluateAll((cards) =>
          cards.map((card) => {
            const link = card.querySelector('a[href^="product.php"]');
            const img = card.querySelector('img');
            const btn = card.querySelector('button');
            return {
              name: link?.textContent?.trim() ?? '',
              imgSrc: img?.getAttribute('src') ?? '',
              imgVisible: !!img && img.offsetParent !== null,
              text: card.textContent ?? '',
              hasAddBtn: !!btn && /add .*to cart/i.test(btn.textContent ?? ''),
              btnVisible: !!btn && btn.offsetParent !== null,
            };
          }),
        );
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          expect(item.name, `Sản phẩm thứ ${index + 1} phải có tên`).not.toBe('');
          expect(item.imgVisible, `Sản phẩm "${item.name}" phải có hình ảnh hiển thị`).toBe(true);
          expect(item.imgSrc, `Ảnh của sản phẩm "${item.name}" phải có đường dẫn src hợp lệ`).toBeTruthy();
          expect(item.text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/), `Sản phẩm "${item.name}" phải hiển thị giá hợp lệ`).not.toBeNull();
          expect(item.hasAddBtn && item.btnVisible, `Sản phẩm "${item.name}" phải có nút thêm vào giỏ hàng`).toBe(true);
        }
      });
    }
  });

  test('PR-04: Sắp xếp theo giá thấp đến cao', async ({ page }) => {
    test.setTimeout(60000);
    let initialCount = 0;
    let sortedPrices: number[] = [];

    await test.step('Tại ô "Sort by", chọn "Price: Low to High"', async () => {
      initialCount = await productPage.productList.count();

      const option = productPage.sortDropdown.getByRole('option', {
        name: /price\W*low\W+to\W+high/i,
      });
      await expect(option, 'Phải tìm thấy tùy chọn sắp xếp giá từ thấp đến cao').toHaveCount(1);
      const value = await option.getAttribute('value');
      expect(value).not.toBeNull();
      await productPage.sortDropdown.selectOption(value!);
    });

    await test.step('Ghi lại giá của các sản phẩm theo đúng thứ tự hiển thị từ trên xuống dưới', async () => {
      const productCards = page.locator('.product-item');
      // Lấy toàn bộ nội dung text của các thẻ trong 1 lần gọi duy nhất
      const allTexts = await productCards.allInnerTexts();
      sortedPrices = allTexts.map((cardText, index) => {
        const match = cardText.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
        expect(match, `Sản phẩm thứ ${index + 1} phải hiển thị giá`).not.toBeNull();
        return Number(match![1].replaceAll(',', ''));
      });
    });

    await test.step('So sánh giá của từng cặp sản phẩm liền kề', async () => {
      // Danh sách được sắp xếp lại theo giá tăng dần
      for (let i = 0; i < sortedPrices.length - 1; i += 1) {
        expect(
          sortedPrices[i],
          `Sản phẩm thứ ${i + 1} ($${sortedPrices[i]}) phải có giá nhỏ hơn hoặc bằng sản phẩm thứ ${i + 2} ($${sortedPrices[i + 1]})`,
        ).toBeLessThanOrEqual(sortedPrices[i + 1]);
      }

      const expectedPrices = [...sortedPrices].sort((left, right) => left - right);
      expect(sortedPrices, 'Danh sách sản phẩm phải được sắp xếp tăng dần từ thấp đến cao').toEqual(
        expectedPrices,
      );

      // Số lượng sản phẩm không thay đổi so với trước khi sắp xếp
      expect(
        sortedPrices.length,
        'Số lượng sản phẩm sau khi sắp xếp giá thấp đến cao phải giữ nguyên',
      ).toBe(initialCount);
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

  test('PR-09: Kiểm tra chức năng hiển thị chi tiết sản phẩm và đối chiếu tên giá khi bấm vào một sản phẩm',async ({page}) => {
    let selectedName ='';
    let selectedHref:string|null = null;
    let selectedPrice = 0;
    await test.step('1) Chọn một sản phẩm bất kỳ trong trang sản phẩm và ghi nhận tên cùng giá bán hiển thị.',async () => {
      await expect(page).toHaveURL(/\/mens-wear\.php(?:[?#]|$)/);
      const productCard = page.locator('.product-item').first();
      await expect(productCard, 'Phải có ít nhất một sản phẩm hiển thị trong danh mục.').toBeVisible();

      const productLink = productCard
          .locator('a[href^="product.php"]')
          .filter({ hasText: /\S/ })
          .first();
      await expect(productLink).toBeVisible();

      selectedName =(await productLink.innerText()).trim();
      selectedHref = await productLink.getAttribute('href');
      expect(selectedName,'Tên sản phẩm không được rỗng').not.toBe('');

      const cardText = await productCard.innerText();
      const priceMatch= cardText.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
      expect(priceMatch, 'Sản phẩm "${selectedName}" phải hiển thị giá bán hợp lệ.').not.toBeNull();
      selectedPrice = Number(priceMatch![1].replaceAll('.',''));

    });

    await test.step('2) Bấm sản phẩm đã chọn.',async () => {
      const targetLink = page.locator('.product-item').first().locator('a[href^="product.php"]').filter({ hasText: /\S/ }).first();
      await targetLink.click();

    });

    await test.step('3) Quan sát giao diện và thông tin trang được chuyển đến.',async () => {
      await expect(page).toHaveURL(/\/product\.php(?:[?#]|$)/);

      if(selectedHref){
        expect(page.url(),'URL trang chi tiết phải khớp với liên kết sản phẩm vừa chọn.').toContain(selectedHref);
      }
      const detailTitle = page
          .locator('h1, h2, h3, h4, h5')
          .filter({ hasText: selectedName })
          .first()
          .or(page.getByText(selectedName, { exact: true }).first());
      await expect(detailTitle.first()).toBeVisible();

      const detailArea = await page.evaluate(()=>{
        const clone = document.body.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.product-item, header, nav, footer').forEach((ex) =>ex.remove());
        return clone.innerText;

      });

      const detailPrices = [...detailArea.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)/g)].map((match) => Number(match[1].replaceAll(',', '')),);
      expect(detailPrices,`Trang chi tiết phải hiển thị đúng giá $${selectedPrice} của sản phẩm "${selectedName}".`).toContain(selectedPrice);

    });

  });
});