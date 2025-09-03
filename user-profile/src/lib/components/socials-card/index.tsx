import { BuildingIcon } from 'app-zephyr-icons/Building';
import { LinkIcon } from 'app-zephyr-icons/Link';
import { MailIcon } from 'app-zephyr-icons/Mail';
import { User } from 'ze-api-contract/user-v2/get-current-user';
import { BackgroundCard } from 'app-zephyr-components/BackgroundCard';

import { useStyles } from './styles';

interface SocialsProps {
  user: User;
}

export function SocialsCard({ user }: SocialsProps) {
  const { classes, theme } = useStyles();

  const iconColor = theme.palette.brand.turquoise[500];

  return (
    <BackgroundCard>
      <div className={classes.root}>
        <span className={classes.title}>Socials</span>
        {user.company && (
          <div className={classes.line}>
            <BuildingIcon color={iconColor} />
            <span>{user.company}</span>
          </div>
        )}
        {user.personalEmail && (
          <div className={classes.line}>
            <MailIcon color={iconColor} />
            <span>{user.personalEmail}</span>
          </div>
        )}
        {user.webpage && (
          <div className={classes.line}>
            <LinkIcon color={iconColor} />
            <span>{user.webpage}</span>
          </div>
        )}
      </div>
    </BackgroundCard>
  );
}
