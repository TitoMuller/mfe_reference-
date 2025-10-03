import { Error } from 'app-zephyr-components/AlertContent';
import { useOrganizationList } from 'app-zephyr-domains/user';
import { User } from 'ze-api-contract/user-v2/get-current-user';

import { OrganizationsCard } from '../../components/organizations-card';
import { OrganizationsCardSkeleton } from '../../components/organizations-card/organizations-card-skeleton';

interface OrganizationsProps {
  isAuthUser: boolean;
  user: User;
}

export function Organizations({ isAuthUser, user }: OrganizationsProps) {
  const { organizationList, isLoading: isOrgListLoading, error: orgListError } = useOrganizationList(user.email);

  if (isOrgListLoading) return <OrganizationsCardSkeleton />;
  if (!organizationList) return <Error error={orgListError} />;

  return <OrganizationsCard isAuthUser={isAuthUser} organizationList={organizationList} />;
}
