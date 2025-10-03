import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import { Link } from 'app-zephyr-components/Link';
import { RouteNames } from 'app-zephyr-routes';
import { AvailableOrganization } from 'ze-api-contract/user-v2/get-current-user-organizations-list';
import { BackgroundCard } from 'app-zephyr-components/BackgroundCard';
import { BuildingIcon } from 'app-zephyr-icons/Building';
import { useStyles } from './styles';

interface OrganizationsProps {
  organizationList: AvailableOrganization[];
  isAuthUser: boolean;
}

function getSubTitle(length: number): string {
  return length > 1 ? 'organizations' : 'organization';
}

export function OrganizationsCard({ isAuthUser, organizationList }: OrganizationsProps) {
  const { classes, theme } = useStyles();

  return (
    <BackgroundCard>
      <div className={classes.header}>
        <span className={classes.title}>Organizations</span>
        {isAuthUser && (
          <Link to={RouteNames.PERSONAL_DASHBOARD} className={classes.link}>
            Show more
          </Link>
        )}
      </div>
      <div className={classes.subTitle}>
        <BuildingIcon color={theme.palette.brand.turquoise[500]} width={24} height={24} />{' '}
        <span>
          {organizationList.length
            ? `${organizationList.length.toString()} ${getSubTitle(organizationList.length)}`
            : 'No organizations yet'}
        </span>
      </div>
      <div className={classes.organizationList}>
        {organizationList.slice(0, 3).map((organization) => (
          <Tooltip arrow key={organization.id} placement="top" title={organization.name}>
            <div>
              <Avatar
                alt={organization.name}
                src={organization.portrait}
                sx={{
                  width: '2.25rem',
                  height: '2.25rem',
                  backgroundColor: organization.avatarColor ?? theme.palette.brand.primary,
                }}
              >
                {organization.name.charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </Tooltip>
        ))}
      </div>
    </BackgroundCard>
  );
}
