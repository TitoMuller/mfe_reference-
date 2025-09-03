import { getLeftSidePanelItems, GetLeftSidePanelItem } from 'app-zephyr-components/LeftSideNavigationMenu';
import { user_settings_emails_path, user_settings_path, user_settings_user_tokens_path } from 'app-zephyr-routes';
import { navTitle } from 'app-zephyr-constants';

type Pages = 'public' | 'emails' | 'user-tokens';

function getProfileLeftSidePanelItems(activePage: Pages) {
  const sourceItems: GetLeftSidePanelItem[] = [
    { title: navTitle.PUBLIC_PROFILE, getPath: user_settings_path, active: activePage === 'public' },
    { title: navTitle.EMAILS, getPath: user_settings_emails_path, active: activePage === 'emails' },
    { title: navTitle.USER_API_TOKENS, getPath: user_settings_user_tokens_path, active: activePage === 'user-tokens' },
  ];

  return getLeftSidePanelItems({ sourceItems, pathProps: {} });
}

export { getProfileLeftSidePanelItems };
