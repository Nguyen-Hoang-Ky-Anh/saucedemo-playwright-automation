import { expect, Locator, Page } from '@playwright/test';
import type { BillingData } from '../tests/qa-automation-labs/test-data';

export interface CheckoutFieldObservation {
  label: string;
  attemptedLength: 1 | 256;
  length: number;
  maxLength: number | null;
  validationMessage: string;
}

export interface CheckoutObservation {
  stage: string;
  fields: CheckoutFieldObservation[];
  visibleErrors: string[];
  urlBeforeContinue: string;
  currentUrl: string;
  urlChanged: boolean;
  checkoutFieldsRemain: boolean;
  horizontalOverflow: boolean;
  documentWidth: number;
  viewportWidth: number;
}

export class QaAutomationLabsCheckoutPage {
  readonly checkoutButton: Locator;
  readonly checkoutForm: Locator;
  readonly inputFields: Locator;
  readonly continueButton: Locator;
  readonly placeOrderButton: Locator;
  readonly errorMessages: Locator;
  readonly cancelBackButton: Locator;
  readonly confirmationHeading: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('link', { name: /proceed to checkout/i });
    this.checkoutForm = page
      .locator('form')
      .filter({ has: page.getByRole('spinbutton') });
    this.inputFields = this.checkoutForm
      .getByRole('textbox')
      .or(this.checkoutForm.getByRole('spinbutton'));
    this.continueButton = page.getByRole('button', { name: /continue|next/i });
    this.placeOrderButton = page
      .getByRole('button', { name: /place\s*order/i })
      .or(page.getByRole('link', { name: /place\s*order/i }));
    this.errorMessages = page
      .getByRole('alert')
      .or(page.locator('.alert, .error, .invalid-feedback, [class*="error"], [class*="alert"]'));
    this.cancelBackButton = page
      .getByRole('button', { name: /cancel|back/i })
      .or(page.getByRole('link', { name: /cancel|back/i }));
    // "Thank You for Your Order!" or similar confirmation
    this.confirmationHeading = page
      .getByRole('heading', {
        name: /thank\s*you|order\s*(success|confirm|placed)|đặt\s*hàng\s*thành\s*công/i,
      })
      .or(page.getByText(/thank you for your order/i));
  }

  /**
   * Fills the Billing Address form using structured TD-05 data.
   * Maps each visible input to the right value by inspecting label/name/placeholder.
   */
  async fillBillingForm(data: BillingData): Promise<void> {
    await this.expectInformationStep();
    const count = await this.inputFields.count();
    for (let i = 0; i < count; i++) {
      const field = this.inputFields.nth(i);
      const meta = await field.evaluate((el) => {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        const labels = Array.from(input.labels ?? [])
          .map((l) => l.innerText.trim())
          .join(' ');
        return {
          text: `${labels} ${input.placeholder ?? ''} ${input.name ?? ''} ${input.id ?? ''}`.toLowerCase(),
          type: input.getAttribute('type') ?? 'text',
        };
      });

      const t = meta.text;
      let value = '';

      if (t.includes('middle') || t.includes('mname')) {
        value = data.middleName || data.firstName;
      } else if (t.includes('first') || t.includes('fname')) {
        value = data.firstName;
      } else if (t.includes('last') || t.includes('lname') || t.includes('surname')) {
        value = data.lastName;
      } else if (meta.type === 'email' || t.includes('email') || t.includes('mail')) {
        value = data.email;
      } else if (t.includes('phone') || t.includes('tel') || t.includes('mobile')) {
        value = data.phone;
      } else if (
        t.includes('card') && (t.includes('number') || t.includes('num') || t.includes('no'))
      ) {
        value = data.cardNumber;
      } else if (t.includes('expir') || t.includes('exp') || t.includes('mm/') || t.includes('yy')) {
        value = data.cardExpiry;
      } else if (t.includes('cvv') || t.includes('cvc') || t.includes('security') || t.includes('code')) {
        value = data.cardCvv;
      } else if (
        meta.type === 'number' ||
        t.includes('zip') ||
        t.includes('postal') ||
        t.includes('pin')
      ) {
        value = data.zip;
      } else if (t.includes('city') || t.includes('town')) {
        value = data.city;
      } else if (t.includes('state') || t.includes('province') || t.includes('region')) {
        value = data.state;
      } else if (t.includes('country')) {
        value = data.country;
      } else if (
        t.includes('address') ||
        t.includes('street') ||
        t.includes('addr')
      ) {
        value = data.address;
      } else {
        // fallback: fill with firstName
        value = data.firstName;
      }

      if (meta.type === 'number') {
        const numeric = value.replace(/\D/g, '');
        await field.fill(numeric);
      } else {
        await field.fill(value);
      }
    }
  }

  /**
   * Fills billing form with one field deliberately left empty (by fieldIndex).
   * Returns the label of the field that was left empty.
   */
  async fillBillingFormExceptOne(data: BillingData, omitIndex: number): Promise<string> {
    await this.expectInformationStep();
    const count = await this.inputFields.count();
    let omittedLabel = `field[${omitIndex}]`;

    for (let i = 0; i < count; i++) {
      const field = this.inputFields.nth(i);
      const meta = await field.evaluate((el) => {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        const labels = Array.from(input.labels ?? [])
          .map((l) => l.innerText.trim())
          .join(' ');
        return {
          text: `${labels} ${input.placeholder ?? ''} ${input.name ?? ''} ${input.id ?? ''}`.toLowerCase(),
          label: labels || input.placeholder || input.name || input.id || `field[${i}]`,
          type: input.getAttribute('type') ?? 'text',
        };
      });

      if (i === omitIndex) {
        omittedLabel = meta.label;
        await field.clear();
        continue;
      }

      const t = meta.text;
      let value = '';
      if (t.includes('middle') || t.includes('mname')) value = data.middleName || data.firstName;
      else if (t.includes('first') || t.includes('fname')) value = data.firstName;
      else if (t.includes('last') || t.includes('lname') || t.includes('surname')) value = data.lastName;
      else if (meta.type === 'email' || t.includes('email')) value = data.email;
      else if (t.includes('phone') || t.includes('tel') || t.includes('mobile')) value = data.phone;
      else if (t.includes('card') && (t.includes('number') || t.includes('num'))) value = data.cardNumber;
      else if (t.includes('expir') || t.includes('exp')) value = data.cardExpiry;
      else if (t.includes('cvv') || t.includes('cvc') || t.includes('security')) value = data.cardCvv;
      else if (meta.type === 'number' || t.includes('zip') || t.includes('postal') || t.includes('pin')) value = data.zip;
      else if (t.includes('city') || t.includes('town')) value = data.city;
      else if (t.includes('state') || t.includes('province')) value = data.state;
      else if (t.includes('country')) value = data.country;
      else if (t.includes('address') || t.includes('street')) value = data.address;
      else value = data.firstName;

      if (meta.type === 'number') await field.fill(value.replace(/\D/g, ''));
      else await field.fill(value);
    }

    return omittedLabel;
  }

  /**
   * Counts the number of required billing form fields.
   */
  async countRequiredFields(): Promise<number> {
    await this.expectInformationStep();
    return this.inputFields.evaluateAll((els) =>
      els.filter((el) => (el as HTMLInputElement).required || el.getAttribute('required') !== null).length,
    );
  }

  /**
   * Clicks Place Order button and waits for navigation/response.
   */
  async clickPlaceOrder(): Promise<void> {
    await expect(this.placeOrderButton.first(), 'Nút Place Order phải hiển thị.').toBeVisible({ timeout: 15000 });
    await this.placeOrderButton.first().click();
  }

  /**
   * Returns all visible error messages on the page.
   */
  async getVisibleErrors(): Promise<string[]> {
    const errors: string[] = [];
    const count = await this.errorMessages.count();
    for (let i = 0; i < count; i++) {
      const el = this.errorMessages.nth(i);
      if (await el.isVisible()) {
        const text = (await el.innerText()).trim();
        if (text) errors.push(text);
      }
    }
    return errors;
  }

  /**
   * Checks if the confirmation/success page is shown.
   */
  async isOrderConfirmed(): Promise<boolean> {
    if (this.page.url().includes('thanks.php')) return true;
    return this.confirmationHeading.isVisible().catch(() => false);
  }

  async expectInformationStep(): Promise<void> {
    await expect(this.checkoutForm, 'Form nhập thông tin checkout phải hiển thị.').toHaveCount(1);
    await expect(this.inputFields.first(), 'Form phải có ít nhất một ô nhập văn bản/số.').toBeVisible();
    await expect(this.continueButton, 'Nút tiếp tục phải tồn tại.').toHaveCount(1);
  }

  async fillFields(length: 1 | 256): Promise<void> {
    await this.expectInformationStep();
    const count = await this.inputFields.count();
    for (let index = 0; index < count; index += 1) {
      const field = this.inputFields.nth(index);
      const label = await this.readFieldLabel(field);
      const isPhone = /phone|tel|mobile|điện thoại/i.test(label);
      const value = isPhone ? (length === 1 ? '1' : '1'.repeat(256)) : length === 1 ? 'A' : 'A'.repeat(256);
      const inputType = await field.getAttribute('type');
      if (inputType === 'number' && !/^\d*$/.test(value)) {
        // Number controls reject alphabetic keystrokes; leave the browser's actual resulting value observable.
        await field.pressSequentially(value);
      } else {
        await field.fill(value);
      }
    }
  }

  async recordObservation(stage: string, urlBeforeContinue: string): Promise<CheckoutObservation> {
    const fields: CheckoutFieldObservation[] = [];
    for (let index = 0; index < (await this.inputFields.count()); index += 1) {
      const field = this.inputFields.nth(index);
      const details = await field.evaluate((element) => {
        const input = element as HTMLInputElement | HTMLTextAreaElement;
        const associatedLabels = Array.from(input.labels ?? [])
          .map((label) => label.innerText.trim())
          .filter(Boolean);
        const label =
          associatedLabels.join(' ') ||
          input.getAttribute('aria-label') ||
          input.getAttribute('placeholder') ||
          input.getAttribute('name') ||
          'unlabeled field';
        const maxLength = input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement
          ? input.maxLength
          : -1;
        return {
          label,
          value: input.value,
          maxLength: maxLength >= 0 ? maxLength : null,
          validationMessage: input.validationMessage,
        };
      });
      fields.push({
        label: details.label,
        attemptedLength: stage.includes('256') ? 256 : 1,
        length: details.value.length,
        maxLength: details.maxLength,
        validationMessage: details.validationMessage,
      });
    }

    const visibleErrors: string[] = [];
    for (let index = 0; index < (await this.errorMessages.count()); index += 1) {
      const error = this.errorMessages.nth(index);
      if (await error.isVisible()) {
        const message = (await error.innerText()).trim();
        if (message) {
          visibleErrors.push(message);
        }
      }
    }
    const layout = await this.page.evaluate(() => {
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );
      const viewportWidth = document.documentElement.clientWidth;
      return {
        horizontalOverflow: documentWidth > viewportWidth,
        documentWidth,
        viewportWidth,
      };
    });
    const currentUrl = this.page.url();
    const checkoutFieldsRemain = (await this.inputFields.count()) > 0;

    return {
      stage,
      fields,
      visibleErrors,
      urlBeforeContinue,
      currentUrl,
      urlChanged: currentUrl !== urlBeforeContinue,
      checkoutFieldsRemain,
      ...layout,
    };
  }

  async clickContinueAndObserve(stage: string): Promise<CheckoutObservation> {
    const urlBeforeContinue = this.page.url();
    await this.continueButton.click();
    return this.recordObservation(stage, urlBeforeContinue);
  }

  async returnToInformationStep(): Promise<void> {
    if (await this.inputFields.count()) {
      return;
    }

    // TODO: Nếu Continue chuyển bước, xác minh Cancel/Back là lối quay lại an toàn.
    if ((await this.cancelBackButton.count()) && (await this.cancelBackButton.first().isVisible())) {
      await this.cancelBackButton.first().click();
    }
    if (await this.inputFields.count()) {
      return;
    }

    // TODO: Nếu không có Cancel/Back, mở lại checkout từ giỏ bằng các điều khiển trên site.
    const cartIcon = this.page.locator('a[href$="cart.php"]').first();
    await expect(cartIcon, 'Có thể quay lại giỏ để mở lại checkout.').toBeVisible();
    await cartIcon.click();
    await expect(this.page).toHaveURL(/\/cart\.php(?:[?#]|$)/);
    await this.checkoutButton.click();
    await this.expectInformationStep();
  }

  private async readFieldLabel(field: Locator): Promise<string> {
    return field.evaluate((element) => {
      const input = element as HTMLInputElement | HTMLTextAreaElement;
      const associatedLabels = Array.from(input.labels ?? [])
        .map((label) => label.innerText.trim())
        .filter(Boolean);
      return (
        associatedLabels.join(' ') ||
        input.getAttribute('aria-label') ||
        input.getAttribute('placeholder') ||
        input.getAttribute('name') ||
        'unlabeled field'
      );
    });
  }
}
