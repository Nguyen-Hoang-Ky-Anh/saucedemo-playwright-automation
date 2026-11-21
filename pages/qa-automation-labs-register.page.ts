import { Locator, Page } from '@playwright/test';

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  country: string;
  password: string;
  passwordConfirm: string;
};

export class QaAutomationLabsRegisterPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly telephoneInput: Locator;
  readonly maleRadio: Locator;
  readonly femaleRadio: Locator;
  readonly otherRadio: Locator;
  readonly dateOfBirthInput: Locator;
  readonly countrySelect: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessages: Locator;
  readonly passwordStrengthIndicator: Locator;
  readonly passwordStrengthBar: Locator;
  readonly firstNameCharacterCount: Locator;
  readonly createAccountHeading: Locator;
  readonly personalDetailsSection: Locator;
  readonly fashionCheckbox: Locator;
  readonly electronicsCheckbox: Locator;
  readonly sportsCheckbox: Locator;
  readonly booksCheckbox: Locator;
  readonly profilePhotoInput: Locator;
  readonly signInLink: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name', { exact: true });
    this.lastNameInput = page.getByPlaceholder('Last Name', { exact: true });
    this.emailInput = page.getByPlaceholder('E-Mail', { exact: true });
    this.telephoneInput = page.getByRole('spinbutton', { name: 'Telephone*' });
    this.maleRadio = page.getByRole('radio', { name: 'Male', exact: true });
    this.femaleRadio = page.getByRole('radio', { name: 'Female', exact: true });
    this.otherRadio = page.getByRole('radio', { name: 'Other', exact: true });
    this.dateOfBirthInput = page.getByRole('textbox', { name: 'Date of Birth' });
    this.countrySelect = page.getByRole('combobox', { name: 'Country' });
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.passwordConfirmInput = page.getByPlaceholder('Password Confirm', { exact: true });
    this.registerButton = page.getByRole('button', { name: 'Register', exact: true });
    this.errorMessages = page.getByRole('alert');
    this.passwordStrengthIndicator = page.getByText(/^Password strength:/);
    this.passwordStrengthBar = page.getByRole('progressbar');
    this.firstNameCharacterCount = page.getByText(/^\d+ characters?$/);
    this.createAccountHeading = page.getByRole('heading', { name: /create your account/i });
    this.personalDetailsSection = page.getByRole('heading', { name: /your personal details/i });
    this.fashionCheckbox = page.getByRole('checkbox', { name: 'Fashion', exact: true }).or(page.locator('input[type="checkbox"][value="Fashion"]'));
    this.electronicsCheckbox = page.getByRole('checkbox', { name: 'Electronics', exact: true }).or(page.locator('input[type="checkbox"][value="Electronics"]'));
    this.sportsCheckbox = page.getByRole('checkbox', { name: 'Sports', exact: true }).or(page.locator('input[type="checkbox"][value="Sports"]'));
    this.booksCheckbox = page.getByRole('checkbox', { name: 'Books', exact: true }).or(page.locator('input[type="checkbox"][value="Books"]'));
    this.profilePhotoInput = page.locator('input[type="file"]');
    this.signInLink = page.getByRole('link', { name: /sign in|login/i });
  }

  async open(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.page.goto('/register.php', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await this.registerButton.waitFor({ state: 'visible', timeout: 10000 });
        return;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await this.page.waitForTimeout(1000 * attempt);
      }
    }
  }

  async fillRequiredFields(data: Omit<RegisterData, 'gender'> & { gender?: RegisterData['gender'] }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.telephoneInput.fill(data.telephone);

    if (data.gender) {
      const genderRadio = {
        Male: this.maleRadio,
        Female: this.femaleRadio,
        Other: this.otherRadio,
      }[data.gender];
      await genderRadio.check();
    }

    await this.dateOfBirthInput.fill(data.dateOfBirth);
    if (data.country) {
      try {
        await this.countrySelect.selectOption({ label: data.country }, { timeout: 3000 });
      } catch {
        await this.countrySelect.selectOption({ index: 1 });
      }
    } else {
      await this.countrySelect.selectOption({ index: 0 });
    }
    await this.passwordInput.fill(data.password);
    await this.passwordConfirmInput.fill(data.passwordConfirm);
  }
}
