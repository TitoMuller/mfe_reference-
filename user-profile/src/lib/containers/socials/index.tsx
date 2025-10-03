import { Error } from 'app-zephyr-components/AlertContent';
import { useUser } from 'app-zephyr-domains/user';

import { SocialsCard } from '../../components/socials-card';
import { SocialsCardSkeleton } from '../../components/socials-card/socials-card-skeleton';

interface SocialsProps {
  username?: string;
}

export function Socials({ username }: SocialsProps) {
  const { user, isLoading, error } = useUser(username);

  if (isLoading) return <SocialsCardSkeleton />;
  if (!!error || !user) return <Error error={error} />;

  return <SocialsCard user={user} />;
}
