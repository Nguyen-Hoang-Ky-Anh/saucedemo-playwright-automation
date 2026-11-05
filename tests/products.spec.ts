import { test, expect } from '../fixtures/test.fixture';

test.describe('Products Inventory Feature (PR-01 to PR-07)', () => {
  test('PR-01: Kiểm tra trang sản phẩm hiển thị đủ số lượng sản phẩm', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    // Điều kiện tiên quyết: Đã đăng nhập và đang ở trang sản phẩm (/inventory.html)
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.titleHeader).toHaveText('Products');

    // Bước 1: Quan sát danh sách sản phẩm hiển thị trên trang chủ
    // Kết quả mong đợi 1: Hiển thị chính xác 6 sản phẩm
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    // Kết quả mong đợi 2: Mỗi sản phẩm hiển thị đầy đủ tên, giá và nút Add to cart
    for (let i = 0; i < 6; i++) {
      const item = inventoryPage.inventoryItems.nth(i);

      // Kiểm tra Tên sản phẩm hiển thị và có nội dung
      const itemName = item.locator('[data-test="inventory-item-name"]');
      await expect(itemName).toBeVisible();
      expect((await itemName.textContent())?.trim().length).toBeGreaterThan(0);

      // Kiểm tra Giá sản phẩm hiển thị và đúng định dạng tiền tệ ($)
      const itemPrice = item.locator('[data-test="inventory-item-price"]');
      await expect(itemPrice).toBeVisible();
      await expect(itemPrice).toContainText('$');

      // Kiểm tra Nút Add to cart hiển thị
      const addButton = item.locator('button[data-test^="add-to-cart"]');
      await expect(addButton).toBeVisible();
      await expect(addButton).toHaveText('Add to cart');
    }
  });

  test('PR-02: Kiểm tra chức năng sắp xếp sản phẩm theo tên (A-Z)', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Bước 1 & 2: Chọn tùy chọn "Name (A to Z)" (value="az")
    await inventoryPage.selectSortOption('az');

    // Kết quả mong đợi: Tên sản phẩm hiển thị theo thứ tự bảng chữ cái tăng dần từ A đến Z
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    const productNames = await inventoryPage.getAllProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    const sortedNamesExpected = [...productNames].sort((a, b) => a.localeCompare(b));
    expect(productNames).toEqual(sortedNamesExpected);
  });

  test('PR-03: Kiểm tra chức năng sắp xếp sản phẩm theo tên (Z-A)', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Bước 1 & 2: Nhấn vào dropdown sắp xếp và chọn "Name (Z to A)" (value="za")
    await inventoryPage.selectSortOption('za');

    // Kết quả mong đợi: Danh sách sản phẩm được cập nhật theo thứ tự giảm dần từ Z đến A
    await expect(inventoryPage.sortDropdown).toHaveValue('za');
    const productNames = await inventoryPage.getAllProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    const sortedNamesExpected = [...productNames].sort((a, b) => b.localeCompare(a));
    expect(productNames).toEqual(sortedNamesExpected);
  });

  test('PR-04: Kiểm tra chức năng sắp xếp sản phẩm theo giá (Thấp đến Cao)', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Bước 1 & 2: Chọn tùy chọn "Price (low to high)" (value="lohi")
    await inventoryPage.selectSortOption('lohi');

    // Kết quả mong đợi: Danh sách cập nhật, giá sản phẩm hiển thị theo thứ tự tăng dần
    await expect(inventoryPage.sortDropdown).toHaveValue('lohi');
    const productPrices = await inventoryPage.getAllProductPrices();
    expect(productPrices.length).toBeGreaterThan(0);

    const sortedPricesExpected = [...productPrices].sort((a, b) => a - b);
    expect(productPrices).toEqual(sortedPricesExpected);
  });

  test('PR-05: Kiểm tra chức năng sắp xếp sản phẩm theo giá (Cao đến Thấp)', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Bước 1 & 2: Chọn tùy chọn "Price (high to low)" (value="hilo")
    await inventoryPage.selectSortOption('hilo');

    // Kết quả mong đợi: Danh sách cập nhật, giá sản phẩm hiển thị theo thứ tự giảm dần
    await expect(inventoryPage.sortDropdown).toHaveValue('hilo');
    const productPrices = await inventoryPage.getAllProductPrices();
    expect(productPrices.length).toBeGreaterThan(0);

    const sortedPricesExpected = [...productPrices].sort((a, b) => b - a);
    expect(productPrices).toEqual(sortedPricesExpected);
  });

  test('PR-06: Kiểm tra chức năng chuyển hướng khi nhấn vào một sản phẩm', async ({ loggedInPage, page }) => {
    const { inventoryPage, productDetailPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Lấy tên và giá của sản phẩm đầu tiên trên danh sách trước khi nhấp
    const firstProductName = (await inventoryPage.itemNames.first().textContent())?.trim();
    const firstProductPrice = (await inventoryPage.itemPrices.first().textContent())?.trim();

    // Bước 1: Chọn và nhấn vào tên của sản phẩm đầu tiên
    await inventoryPage.clickProductByIndex(0);

    // Kết quả mong đợi 1: Hệ thống mở trang chi tiết sản phẩm (/inventory-item.html?id=...)
    await expect(page).toHaveURL(/.*inventory-item\.html/);
    await expect(productDetailPage.backToProductsButton).toBeVisible();

    // Kết quả mong đợi 2: Thông tin hiển thị khớp đúng tên và giá đã chọn
    const detailName = await productDetailPage.getProductName();
    const detailPrice = await productDetailPage.getProductPrice();

    expect(detailName).toBe(firstProductName);
    expect(detailPrice).toBe(firstProductPrice);
  });

  test('PR-07: Kiểm tra các tùy chọn hiển thị và giá trị mặc định của bộ lọc sắp xếp', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);

    // Bước 1: Quan sát trạng thái mặc định của dropdown Sort
    // Kết quả mong đợi 1: Giá trị mặc định của dropdown hiển thị là "Name (A to Z)" (value="az")
    await expect(inventoryPage.sortDropdown).toHaveValue('az');

    // Bước 2: Kiểm tra các tùy chọn hiển thị bên trong dropdown
    // Kết quả mong đợi 2: Dropdown hiển thị đầy đủ 4 lựa chọn sắp xếp hợp lệ
    const options = inventoryPage.sortDropdown.locator('option');
    await expect(options).toHaveCount(4);

    const optionValues = await options.evaluateAll((opts) => opts.map((opt) => (opt as HTMLOptionElement).value));
    const optionTexts = await options.evaluateAll((opts) => opts.map((opt) => opt.textContent?.trim()));

    // Đối chiếu 4 values chuẩn của SauceDemo
    expect(optionValues).toEqual(['az', 'za', 'lohi', 'hilo']);

    // Đối chiếu các nhãn chữ hiển thị cho người dùng
    expect(optionTexts).toEqual([
      'Name (A to Z)',
      'Name (Z to A)',
      'Price (low to high)',
      'Price (high to low)',
    ]);
  });
});
