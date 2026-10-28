// ===== Users (TD-01, TD-02, TD-03, TD-06) =====
export const TEST_USERS = {
    STANDARD: { username: process.env.SAUCE_USERNAME!,        password: process.env.SAUCE_PASSWORD! },          // TD-01
    LOCKED:   { username: process.env.SAUCE_LOCKED_USERNAME!, password: process.env.SAUCE_PASSWORD! },          // TD-02
    INVALID:  { username: process.env.SAUCE_INVALID_USERNAME!, password: process.env.SAUCE_INVALID_PASSWORD! }, // TD-03
    GLITCH:   { username: process.env.SAUCE_GLITCH_USERNAME!, password: process.env.SAUCE_PASSWORD! },          // TD-06
};

// ===== TD-04: số lượng sản phẩm thêm vào giỏ =====
export const CART_QUANTITIES = [3, 5, 6];

// 6 sản phẩm của SauceDemo, theo thứ tự cố định
export const PRODUCT_SLUGS = [
    'sauce-labs-backpack',
    'sauce-labs-bike-light',
    'sauce-labs-bolt-t-shirt',
    'sauce-labs-fleece-jacket',
    'sauce-labs-onesie',
    'test.allthethings()-t-shirt-(red)',
];

export const addToCartId = (slug: string) => `add-to-cart-${slug}`;
export const removeId = (slug: string) => `remove-${slug}`;

// ===== TD-05: thông tin checkout hợp lệ =====
export const CHECKOUT_INFO = {
    FIRST_NAME: 'John',
    LAST_NAME: 'Doe',
    POSTAL_CODE: '12345',
};

export const BUTTON_TEXT = { ADD_TO_CART: 'Add to cart', REMOVE: 'Remove' };

export const ERROR_MESSAGES = {
    CART_REQUIRES_LOGIN: "Epic sadface: You can only access '/cart.html' when you are logged in.",
};

