/** Lấy số tiền từ chuỗi như "Item total: $29.99" → 29.99 */
export const parsePrice = (text: string): number => {
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    if (!match) throw new Error(`Không đọc được giá tiền từ: "${text}"`);
    return Number(match[1]);
};

/** Đổi sang cent để cộng/so sánh, tránh sai số số thực (0.1 + 0.2 ≠ 0.3) */
export const toCents = (amount: number): number => Math.round(amount * 100);