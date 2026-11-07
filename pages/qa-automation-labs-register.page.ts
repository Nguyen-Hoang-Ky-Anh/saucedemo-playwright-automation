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
  }

  async open() {
    await this.page.goto('/register.php');
  }

  async fillRequiredFields(data: RegisterData) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.telephoneInput.fill(data.telephone);

    const genderRadio = {
      Male: this.maleRadio,
      Female: this.femaleRadio,
      Other: this.otherRadio,
    }[data.gender];
    await genderRadio.check();

    await this.dateOfBirthInput.fill(data.dateOfBirth);
    await this.countrySelect.selectOption({ label: data.country });
    await this.passwordInput.fill(data.password);
    await this.passwordConfirmInput.fill(data.passwordConfirm);
  }
}
