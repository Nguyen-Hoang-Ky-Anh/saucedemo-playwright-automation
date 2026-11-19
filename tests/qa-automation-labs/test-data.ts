import type { RegisterData } from '../../pages/qa-automation-labs-register.page';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredGender(): RegisterData['gender'] {
  const value = requiredEnv('QA_REGISTER_TD04_GENDER');
  if (value !== 'Male' && value !== 'Female' && value !== 'Other') {
    throw new Error('QA_REGISTER_TD04_GENDER must be Male, Female, or Other');
  }
  return value;
}

export function getDemoCredentials() {
  return {
    email: requiredEnv('QA_AUTOMATIONLABS_DEMO_EMAIL'),
    password: requiredEnv('QA_AUTOMATIONLABS_DEMO_PASSWORD'),
  };
}

export interface BillingData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

export function getCheckoutTestData() {
  return {
    td05: {
      firstName: requiredEnv('QA_CHECKOUT_TD05_FIRST_NAME'),
      lastName: requiredEnv('QA_CHECKOUT_TD05_LAST_NAME'),
      email: requiredEnv('QA_CHECKOUT_TD05_EMAIL'),
      phone: requiredEnv('QA_CHECKOUT_TD05_PHONE'),
      address: requiredEnv('QA_CHECKOUT_TD05_ADDRESS'),
      city: requiredEnv('QA_CHECKOUT_TD05_CITY'),
      state: requiredEnv('QA_CHECKOUT_TD05_STATE'),
      zip: requiredEnv('QA_CHECKOUT_TD05_ZIP'),
      country: requiredEnv('QA_CHECKOUT_TD05_COUNTRY'),
      cardNumber: requiredEnv('QA_CHECKOUT_TD05_CARD_NUMBER'),
      cardExpiry: requiredEnv('QA_CHECKOUT_TD05_CARD_EXPIRY'),
      cardCvv: requiredEnv('QA_CHECKOUT_TD05_CARD_CVV'),
    } satisfies BillingData,
  };
}

export function getRegisterTestData() {
  const { email } = getDemoCredentials();
  return {
    td04: {
      firstName: requiredEnv('QA_REGISTER_TD04_FIRST_NAME'),
      lastName: requiredEnv('QA_REGISTER_TD04_LAST_NAME'),
      email,
      telephone: requiredEnv('QA_REGISTER_TD04_TELEPHONE'),
      gender: requiredGender(),
      dateOfBirth: requiredEnv('QA_REGISTER_TD04_DOB'),
      country: requiredEnv('QA_REGISTER_TD04_COUNTRY'),
      password: requiredEnv('QA_REGISTER_TD04_PASSWORD'),
      passwordConfirm: requiredEnv('QA_REGISTER_TD04_PASSWORD'),
    } satisfies RegisterData,
    mismatchedPassword: requiredEnv('QA_REGISTER_PASSWORD_MISMATCH'),
    mismatchedPasswordConfirm: requiredEnv('QA_REGISTER_PASSWORD_CONFIRM_MISMATCH'),
    weakPassword: requiredEnv('QA_REGISTER_PASSWORD_WEAK'),
    mediumPassword: requiredEnv('QA_REGISTER_PASSWORD_MEDIUM'),
    strongPassword: requiredEnv('QA_REGISTER_PASSWORD_STRONG'),
  };
}
