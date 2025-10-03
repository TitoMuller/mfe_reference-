import Avatar from '@mui/material/Avatar';

import { Link } from 'app-zephyr-components/Link';
import { RouteNames } from 'app-zephyr-routes';
import { User } from 'ze-api-contract/user-v2/get-current-user';
import { BackgroundCard } from 'app-zephyr-components/BackgroundCard';

import { useStyles } from './styles';

interface ProfileCardProps {
  user: User;
  isAuthUser: boolean;
}

export function ProfileCard({ user, isAuthUser }: ProfileCardProps) {
  const { classes, theme } = useStyles();

  return (
    <BackgroundCard>
      <Avatar
        alt={user.name}
        src={user.portrait ?? ''}
        sx={{ width: '8rem', height: '8rem', backgroundColor: user.avatarColor ?? theme.palette.tx.brand }}
        className={classes.avatar}
      >
        {user.name.charAt(0).toUpperCase()}
      </Avatar>

      <div className={classes.info}>
        {/* <span>{user.username}</span> */}
        <span className={classes.faded}>{user.email}</span>
        {/* <div className={classes.location}>
          <LocationIcon color="secondary" />
          {user.location && (
            <span>
              {user.location.country}, {user.location.city}
            </span>
          )}
        </div> */}
        {isAuthUser && (
          <Link to={RouteNames.USER_PROFILE_SETTINGS} className={classes.edit}>
            Edit Profile
          </Link>
        )}
      </div>
    </BackgroundCard>
  );
}
