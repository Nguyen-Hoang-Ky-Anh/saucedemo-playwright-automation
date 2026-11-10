import { expect, Locator, Page } from '@playwright/test';

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
  readonly errorMessages: Locator;
  readonly cancelBackButton: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh tên và loại điều khiển của nút checkout trên site thật.
    this.checkoutButton = page.getByRole('link', { name: /proceed to checkout/i });
    // TODO: Xác minh form thông tin checkout có đúng một phần tử form.
    this.checkoutForm = page
      .locator('form')
      .filter({ has: page.getByRole('spinbutton') });
    this.inputFields = this.checkoutForm
      .getByRole('textbox')
      .or(this.checkoutForm.getByRole('spinbutton'));
    // TODO: Xác minh nhãn nút chuyển tiếp checkout trên site thật.
    this.continueButton = page.getByRole('button', { name: /continue|next/i });
    // TODO: Xác minh lỗi checkout dùng role="alert".
    this.errorMessages = page.getByRole('alert');
    // TODO: Xác minh nhãn điều hướng quay lại/hủy checkout trên site thật.
    this.cancelBackButton = page
      .getByRole('button', { name: /cancel|back/i })
      .or(page.getByRole('link', { name: /cancel|back/i }));
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
