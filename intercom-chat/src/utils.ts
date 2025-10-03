import { IntercomSettings } from '@intercom/messenger-js-sdk/dist/types';
import { INTERCOM_SETTINGS } from './const';

export function formatFullName(name?: string): string {
  if (!name?.trim()) return '';

  return name
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function isValidEmail(email?: string): boolean {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

  return emailRegex.test(email);
}

export function sanitize(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getSafeIntercomProps(
  user: {
    id?: string;
    name?: string;
    email?: string;
    personalEmail?: string;
    portrait?: string;
    role?: string;
    username?: string;
    company?: string;
  },
  appId: string,
): IntercomSettings {
  const safeName = sanitize(user.name);
  const safeEmail = isValidEmail(user.email) ? user.email : undefined;
  const safePersonalEmail = isValidEmail(user.personalEmail) ? user.personalEmail : undefined;

  const customAttributes: Record<string, unknown> = {
    ...(safePersonalEmail && { personalEmail: safePersonalEmail }),
    ...(user.id && { id: String(user.id) }),
    ...(safeEmail && { systemEmail: safeEmail }),
  };

  return {
    ...INTERCOM_SETTINGS,
    app_id: appId,
    utm_source: 'app',
    utm_content: safeEmail,
    name: formatFullName(safeName),
    avatar: sanitize(user.portrait) ?? '',
    ...(sanitize(user.role) && { role: sanitize(user.role) }),
    ...(sanitize(user.username) && { username: sanitize(user.username) }),
    ...(sanitize(user.company) && { company: sanitize(user.company) }),
    custom_attributes: customAttributes,
    custom_launcher_selector: '#intercom-launcher',
  };
}
