import { IntercomSettings } from '@intercom/messenger-js-sdk/dist/types';

export const INTERCOM_SETTINGS: Partial<IntercomSettings> = {
  app_id: '',
  page_title: 'Zephyr Cloud',
  action_color: '#eeeeee',
  background_color: '#eeeeee',
  vertical_padding: 80,
  horizontal_padding: 20,
  custom_launcher_selector: '#intercom-launcher',
  name: 'Zephyr Non-Logged User',
} as const;
