/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { getSafeIntercomProps, isValidEmail, sanitize } from '../utils';

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag+sorting@example.com')).toBe(true);
    expect(isValidEmail('user_name@example.co.uk')).toBe(true);
  });

  it('should invalidate incorrect emails', () => {
    expect(isValidEmail('plainaddress')).toBe(false);
    expect(isValidEmail('@@example.com')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@site..com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null as any)).toBe(false);
  });
});

describe('sanitize', () => {
  it('should trim strings with content', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('should return undefined for empty or whitespace-only strings', () => {
    expect(sanitize('')).toBeUndefined();
    expect(sanitize('    ')).toBeUndefined();
  });

  it('should return undefined for non-string inputs', () => {
    expect(sanitize(undefined)).toBeUndefined();
    expect(sanitize(null)).toBeUndefined();
    expect(sanitize(123 as any)).toBeUndefined();
    expect(sanitize({} as any)).toBeUndefined();
  });

  it('should return original string if already trimmed', () => {
    expect(sanitize('hello')).toBe('hello');
  });
});

describe('getSafeIntercomProps', () => {
  const baseUser = {
    id: '42',
    name: 'john doe',
    email: 'john@example.com',
    personalEmail: 'personal@example.com',
    portrait: ' avatar.png ',
    role: 'admin',
    username: 'johnny',
    company: 'Acme Inc',
  };
  const appId = 'app-123';

  it('should return properly sanitized and formatted IntercomSettings', () => {
    const result = getSafeIntercomProps(baseUser, appId);

    expect(result.app_id).toBe(appId);
    expect(result.utm_source).toBe('app');
    expect(result.utm_content).toBe(baseUser.email);
    expect(result.name).toBe('John Doe'); // formatFullName applied
    expect(result.avatar).toBe('avatar.png'); // trimmed
    expect(result.role).toBe('admin');
    expect(result.username).toBe('johnny');
    expect(result.company).toBe('Acme Inc');

    expect(result.custom_attributes).toMatchObject({
      personalEmail: baseUser.personalEmail,
      id: String(baseUser.id),
      systemEmail: baseUser.email,
    });
  });

  it('should exclude invalid emails from custom_attributes and utm_content', () => {
    const user = { ...baseUser, email: 'invalid-email', personalEmail: 'also-invalid' };
    const result = getSafeIntercomProps(user, appId);

    expect(result.utm_content).toBeUndefined();
    expect(result.custom_attributes).not.toHaveProperty('personalEmail');
    expect(result.custom_attributes).not.toHaveProperty('systemEmail');
  });

  it('should handle missing optional fields gracefully', () => {
    const user = {
      id: undefined,
      name: '',
      email: '',
      personalEmail: '',
      portrait: '',
      role: '',
      username: '',
      company: '',
    };
    const result = getSafeIntercomProps(user, appId);

    expect(result.name).toBe('');
    expect(result.avatar).toBe('');
    expect(result.role).toBeUndefined();
    expect(result.username).toBeUndefined();
    expect(result.company).toBeUndefined();
    expect(result.custom_attributes).toEqual({});
  });

  it('should convert id to string if it is a number', () => {
    const user = { ...baseUser, id: 12345 as any };
    const result = getSafeIntercomProps(user, appId);
    expect(result.custom_attributes.id).toBe('12345');
  });
});
