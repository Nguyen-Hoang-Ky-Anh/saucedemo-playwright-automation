// ===== Users (TD-01, TD-02, TD-03, TD-06) =====
export const TEST_USERS = {
    STANDARD: { username: process.env.SAUCE_USERNAME || 'standard_user',        password: process.env.SAUCE_PASSWORD || 'secret_sauce' },          // TD-01
    LOCKED:   { username: process.env.SAUCE_LOCKED_USERNAME || 'locked_out_user', password: process.env.SAUCE_PASSWORD || 'secret_sauce' },          // TD-02
    INVALID:  { username: process.env.SAUCE_INVALID_USERNAME || 'invalid_user_123', password: process.env.SAUCE_INVALID_PASSWORD || 'secret_sauce' }, // TD-03
    GLITCH:   { username: process.env.SAUCE_GLITCH_USERNAME || 'performance_glitch_user', password: process.env.SAUCE_PASSWORD || 'secret_sauce' },          // TD-06
};

export const WRONG_PASSWORD = process.env.SAUCE_WRONG_PASSWORD || 'wrong_password';

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
    LOCKED_OUT_USER: 'Epic sadface: Sorry, this user has been locked out.',
    USER_NOT_MATCH: 'Epic sadface: Username and password do not match any user in this service',
    USERNAME_REQUIRED: 'Epic sadface: Username is required',
    PASSWORD_REQUIRED: 'Epic sadface: Password is required',
    INVENTORY_REQUIRES_LOGIN: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    CART_REQUIRES_LOGIN: "Epic sadface: You can only access '/cart.html' when you are logged in.",
};

