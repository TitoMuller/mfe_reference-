import * as Intercom from '@intercom/messenger-js-sdk';
import { IntercomSettings } from '@intercom/messenger-js-sdk/dist/types';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef } from 'react';

import { useCurrentUser } from 'app-zephyr-domains/user';
import { envValue } from 'app-zephyr-environment';
import { getSafeIntercomProps } from './utils';

export const IntercomLauncher = (): ReactElement | null => {
  const { user, isLoading } = useCurrentUser();
  const appId = envValue.value.intercomAppId;
  const hasBooted = useRef(false);

  const intercomProps: IntercomSettings | null = useMemo(() => {
    if (!user || !appId) return null;
    try {
      const safeUser = { ...user, portrait: user.portrait ?? undefined };
      return getSafeIntercomProps(safeUser, appId);
    } catch {
      return null;
    }
  }, [user, appId]);

  useEffect(() => {
    if (!intercomProps) return;
    if (typeof window === 'undefined') return;

    try {
      if (!hasBooted.current) {
        Intercom.default(intercomProps);
        hasBooted.current = true;
      } else {
        Intercom.update(intercomProps);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Intercom:', error);
    }

    return () => {
      try {
        if (hasBooted.current) {
          Intercom.shutdown();
          hasBooted.current = false;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to shutdown Intercom:', error);
      }
    };
  }, [intercomProps]);

  if (isLoading || !user) return null;
  return null;
};
