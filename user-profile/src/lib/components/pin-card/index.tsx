import { useMemo } from 'react';

import { Link } from 'app-zephyr-components/Link';
import { CloudIcon } from 'app-zephyr-icons/Cloud';
import { CubeIcon } from 'app-zephyr-icons/CubeIcon';
import { RemoteIcon } from 'app-zephyr-icons/Remote';
import { application_overview_path, organization_path, project_settings_general_path } from 'app-zephyr-routes';
import { UserPinType } from 'ze-api-contract/enums';

import { useStyles } from './styles';
import { UserPin } from 'ze-api-contract/user-v2/user-pins/get-user-pins';

interface PinCardProps {
  pin: UserPin;
}

// todo: this component should be replaced into app-zephyr-components https://github.com/ZephyrCloudIO/zephyr-cloud-io/issues/598
export function PinCard({ pin }: PinCardProps) {
  const { classes, theme } = useStyles();
  const { project, organization, application, type } = pin;

  const link = useMemo(() => {
    const params = { application: { name: application?.name }, project, organization };

    if (type === UserPinType.Organization) {
      return { url: organization_path(params), label: organization.displayName };
    }
    if (type === UserPinType.Project && project) {
      return { url: project_settings_general_path(params), label: project.displayName };
    }
    if (type === UserPinType.Application && application) {
      return { url: application_overview_path(params), label: application.displayName };
    }

    return { url: '/', label: '' };
  }, [application, project, organization, type]);

  return (
    <div className={classes.root} data-e2e={`pin-card-${organization.displayName.replace(' ', '-').toLowerCase()}`}>
      <div className={classes.header} data-e2e="pin-card-header">
        <div className={classes.pillTag} data-e2e={`pin-card-organization-link`}>
          <Link to={organization_path({ organization })} style={{ textDecoration: 'none' }} className="white">
            {organization.displayName}
          </Link>
        </div>
        <span className={classes.cloud} data-e2e={`pin-card-cloud-provider`}>
          <CloudIcon color={theme.palette.tx.tertiary.hover} className={classes.counterIcon} />
          <span>{pin.cloudProvider}</span>
        </span>
      </div>

      {type !== UserPinType.Organization && project && (
        <div className={classes.breadcrumb} data-e2e="pin-card-project-link">
          {type === UserPinType.Application && (
            <span data-e2e="pin-card-project-name"> / {project.displayName}&nbsp;</span>
          )}
          /&nbsp;
          <Link data-e2e="pin-card-application-link" to={link.url}>
            {link.label}
          </Link>
        </div>
      )}

      <div className={classes.description} data-e2e="pin-card-description">
        {pin.description ?? <span>Description empty</span>}
      </div>

      <div className={classes.footer} data-e2e="pin-card-footer">
        {pin.counters.applications !== undefined && (
          <span className={classes.counter}>
            <CubeIcon color={theme.palette.brand.turquoise['500']} className={classes.counterIcon} />
            <span data-e2e="pin-card-applications-counter">{pin.counters.applications} apps</span>
          </span>
        )}

        <span className={classes.counter}>
          <RemoteIcon color={theme.palette.brand.turquoise['500']} className={classes.counterIcon} />
          <span data-e2e="pin-card-remotes-counter">{pin.counters.remotes} remotes</span>
        </span>
      </div>
    </div>
  );
}
