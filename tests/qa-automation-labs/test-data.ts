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
