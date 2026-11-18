import { expect, test } from '@playwright/test';
import { QaAutomationLabsCartPage } from '../../../pages/qa-automation-labs-cart.page';
import {
  addDistinctProducts,
  addTwoDistinctProducts,
  clearCart,
  expectCartProduct,
} from './cart.helper';
import type { AddedProduct } from './cart.helper';
import { loginAsDemo } from '../product/product-auth.helper';

test.describe('Cart', () => {
  test.describe.configure({ mode: 'serial' });
  let loggedIn = false;

  test.beforeEach(async ({ page }) => {
    loggedIn = false;
    await loginAsDemo(page);
    loggedIn = true;
    // TODO: Xác minh giỏ hàng được lưu theo tài khoản hay theo phiên.
    await clearCart(page);
  });

  test.afterEach(async ({ page }) => {
    if (loggedIn) {
      await clearCart(page);
    }
  });

  // Ưu tiên P1, BVA (min+, n=1).
  test('CT-01: Thêm 1 sản phẩm vào giỏ', async ({ page }) => {
    const cartPage = new QaAutomationLabsCartPage(page);
    let addedProducts: AddedProduct[] = [];

    await test.step('1-3) Chọn 1 sản phẩm trên trang danh mục, bấm Add to Cart và kiểm tra icon giỏ hàng hiển thị số 1.', async () => {
      addedProducts = await addDistinctProducts(page, 1);
      expect(await cartPage.getCartBadgeCount()).toBe(1);
    });

    await cartPage.openCartByIcon();
    const cartProducts = await cartPage.readProducts();
    expect(cartProducts, 'Giỏ hàng phải có đúng 1 sản phẩm sau khi thêm.').toHaveLength(1);
    expectCartProduct(cartProducts[0], addedProducts[0]);
  });

  // Ưu tiên P2, Theo yêu cầu.
  test('CT-02: Thêm 2 sản phẩm khác nhau vào giỏ', async ({ page }) => {
    const cartPage = new QaAutomationLabsCartPage(page);
    let addedProducts: AddedProduct[] = [];

    await test.step('1-3) Thêm lần lượt 2 sản phẩm khác nhau vào giỏ và kiểm tra icon giỏ hàng hiển thị số 2.', async () => {
      addedProducts = await addDistinctProducts(page, 2);
      expect(await cartPage.getCartBadgeCount()).toBe(2);
    });

    await cartPage.openCartByIcon();
    const cartProducts = await cartPage.readProducts();
    expect(cartProducts, 'Giỏ hàng phải có đúng 2 sản phẩm sau khi thêm.').toHaveLength(2);
    expectCartProduct(cartProducts[0], addedProducts[0]);
    expectCartProduct(cartProducts[1], addedProducts[1]);
  });

  test.describe('CT-03', () => {
    let addedProducts: [AddedProduct, AddedProduct];

    test.beforeEach(async ({ page }) => {
      addedProducts = await addTwoDistinctProducts(page);
    });

    // Ưu tiên P1, kỹ thuật chuyển đổi trạng thái.
    test('CT-03: Kiểm tra trang giỏ hàng liệt kê đúng các sản phẩm đã thêm', async ({ page }) => {
      const cartPage = new QaAutomationLabsCartPage(page);
      let recordedProducts: [AddedProduct, AddedProduct] = addedProducts;
      let cartProducts: Awaited<ReturnType<typeof cartPage.readProducts>> = [];

      await test.step('1) Ghi lại tên và giá của hai sản phẩm đã thêm.', async () => {
        recordedProducts = addedProducts;
      });

      await test.step('2) Bấm icon giỏ hàng để mở trang giỏ.', async () => {
        await cartPage.openCartByIcon();
      });

      await test.step('3) Đối chiếu danh sách trong giỏ với thông tin đã ghi.', async () => {
        cartProducts = await cartPage.readProducts();
      });

      expect(cartProducts, 'Trang giỏ hàng phải liệt kê đúng hai sản phẩm.').toHaveLength(2);
      expect(
        cartProducts.map(({ name }) => name).sort(),
        'Tên hai sản phẩm trong giỏ phải đúng với hai sản phẩm đã thêm.',
      ).toEqual(recordedProducts.map(({ name }) => name).sort());

      for (const expected of recordedProducts) {
        const actual = cartProducts.find((product) => product.name === expected.name);
        expect(actual, `Sản phẩm "${expected.name}" phải có trong giỏ.`).toBeDefined();
        expectCartProduct(actual!, expected);
      }
    });
  });

  test.describe('CT-04', () => {
    let seededProducts: [AddedProduct, AddedProduct];

    test.beforeEach(async ({ page }) => {
      seededProducts = await addTwoDistinctProducts(page);
      const cartPage = new QaAutomationLabsCartPage(page);
      await cartPage.openCartByIcon();
      await expect(page).toHaveURL(/\/cart\.php(?:[?#]|$)/);
      await expect(cartPage.cartProducts, 'Điều kiện trước CT-04 cần đúng hai sản phẩm trong giỏ.').toHaveCount(2);
    });

    // Ưu tiên P2, kỹ thuật use case.
    test('CT-04: Kiểm tra xóa một sản phẩm khỏi giỏ hàng', async ({ page }) => {
      const cartPage = new QaAutomationLabsCartPage(page);
      let totalBeforeCents = 0;
      let badgeBefore = 0;
      let removedProduct: AddedProduct | undefined;
      let remainingProduct: AddedProduct | undefined;
      let productsAfterRemoval: Awaited<ReturnType<typeof cartPage.readProducts>> = [];
      let totalAfterCents = 0;
      let badgeAfter = 0;

      await test.step('1) Ghi lại tổng tiền và số trên icon giỏ.', async () => {
        totalBeforeCents = await cartPage.getTotalCents();
        badgeBefore = await cartPage.getCartBadgeCount();
      });

      await test.step('2) Ghi thông tin sản phẩm đầu tiên rồi bấm nút xóa.', async () => {
        const firstProduct = (await cartPage.readProducts())[0];
        expect(firstProduct, 'Phải có sản phẩm đầu tiên để xóa.').toBeDefined();
        removedProduct = {
          name: firstProduct.name,
          priceCents: firstProduct.priceCents,
        };
        remainingProduct = seededProducts.find(({ name }) => name !== removedProduct?.name);
        expect(remainingProduct, 'Giỏ phải còn một sản phẩm khác sản phẩm được xóa.').toBeDefined();
        await cartPage.removeFirstProduct();
      });

      await test.step('3) Quan sát danh sách, tổng tiền và số trên icon giỏ.', async () => {
        await expect(cartPage.cartProducts, 'Sau khi xóa phải còn đúng một sản phẩm.').toHaveCount(1);
        productsAfterRemoval = await cartPage.readProducts();
        totalAfterCents = await cartPage.getTotalCents();
        badgeAfter = await cartPage.getCartBadgeCount();
      });

      expect(
        productsAfterRemoval.some(({ name }) => name === removedProduct?.name),
        'Sản phẩm đã xóa phải biến mất khỏi giỏ.',
      ).toBe(false);
      const remainingInCart = productsAfterRemoval[0];
      expect(remainingInCart?.name, 'Sản phẩm còn lại phải giữ nguyên tên.').toBe(remainingProduct?.name);
      expect(remainingInCart?.priceCents, 'Sản phẩm còn lại phải giữ nguyên giá.').toBe(
        remainingProduct?.priceCents,
      );
      expect(remainingInCart?.quantity, 'Số lượng sản phẩm còn lại phải vẫn bằng 1.').toBe(1);

      expect(
        totalAfterCents,
        'Tổng tiền mới phải bằng tổng cũ trừ giá của sản phẩm đã xóa.',
      ).toBe(totalBeforeCents - (removedProduct?.priceCents ?? 0));
      expect(badgeBefore, 'Số trên icon giỏ trước khi xóa phải là 2.').toBe(2);
      expect(badgeAfter, 'Số trên icon giỏ sau khi xóa phải giảm từ 2 xuống 1.').toBe(1);
    });
  });

  test.describe('CT-07', () => {
    test.beforeEach(async ({ page }) => {
      await addTwoDistinctProducts(page);
      const cartPage = new QaAutomationLabsCartPage(page);
      await cartPage.openCartByIcon();
      await expect(page).toHaveURL(/\/cart\.php(?:[?#]|$)/);
      await expect(
          cartPage.cartProducts,
          'Điều kiện trước CT-07 cần ít nhất hai sản phẩm trong giỏ',
      ).toHaveCount(2);
    });

    test('CT-07: Kiểm tra tính tổng tiền giỏ hàng', async ({ page }) => {
      const cartPage = new QaAutomationLabsCartPage(page);
      let cartProducts: Awaited<ReturnType<typeof cartPage.readProducts>> = [];
      let expectedTotalCents = 0;
      let displayedTotalCents = 0;

      await test.step('1) Đọc đơn giá và số lượng của từng dòng sản phẩm trong giỏ hàng', async () => {
        cartProducts = await cartPage.readProducts();
        expect(cartProducts.length, 'Giỏ hàng phải có sản phẩm để tính tổng tiền').toBeGreaterThanOrEqual(2);
      });

      await test.step('2) Tính tổng (đơn giá × số lượng) của tất cả các dòng', async () => {
        expectedTotalCents = cartProducts.reduce(
            (sum, product) => sum + product.priceCents * product.quantity,
            0,
        );
      });

      await test.step('3) Đọc tổng tiền hiển thị trên trang giỏ hàng và đối chiếu', async () => {
        displayedTotalCents = await cartPage.getTotalCents();
        expect(
            displayedTotalCents,
            'Tổng tiền hiển thị phải bằng tổng (đơn giá × số lượng) của các dòng cộng lại',
        ).toBe(expectedTotalCents);
      });
    });
  });
});