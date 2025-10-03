import { useState, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Stack } from '@mui/material';

import {
  ProfileSettings,
  ProfileSettingsBodyReq,
  OwnedOrganization,
} from 'ze-api-contract/user-v2/profile-settings/interfaces';
import { DangerZoneContainer } from 'app-zephyr-components/danger-zone';
import { ConfirmModal } from 'app-zephyr-components/confirm-modal';
import { organization_path } from 'app-zephyr-routes';
import {
  PublicProfileSettingsForm,
  ProfileSettingsForm,
  DeleteProfileConfirmForm,
  RenameProfileConfirmForm,
} from 'app-zephyr-forms';

import { useStyles } from './styles';

interface PublicProfileSettingsContainerProps {
  settings: ProfileSettings;
  onUpdateSettings: (val: ProfileSettingsBodyReq) => Promise<void>;
  onDeleteProfile: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  nameIsChanged: (value: string) => Promise<void | boolean>;
}

function getFormSettingsValue({
  name,
  email,
  username,
  description,
  socialAccounts,
  avatarColor,
  userPortrait,
}: ProfileSettings): ProfileSettingsForm {
  const defaultSocialAcc = socialAccounts?.length ? socialAccounts : [{ label: '', link: '' }];
  return { name, email, description, avatarColor, userPortrait, username, socialAccounts: defaultSocialAcc };
}

function getOrganizationsString(orgs: OwnedOrganization[]): ReactNode {
  return (
    <>
      {orgs.map((item, index) => (
        <span key={'org_' + item.name}>
          <Link className="orgLink" to={organization_path({ organization: { name: item.name } })}>
            {item.displayName}
          </Link>
          {index !== orgs.length - 1 && ', '}
        </span>
      ))}
    </>
  );
}

function PublicProfileSettingsContainer({
  settings,
  onUpdateSettings,
  onDeleteProfile,
  nameIsChanged,
}: PublicProfileSettingsContainerProps) {
  const { classes } = useStyles();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [confirmIsAvailable, setConfirmIsAvailable] = useState(false);
  const [validRenameForm, setValidRenameForm] = useState(false);
  const [userName, setUserName] = useState<string>();

  const DeleteProfileHandler = () => {
    setOpenModal(false);
    void onDeleteProfile();
  };

  const isConfirmFormValid = (val: boolean) => {
    setConfirmIsAvailable(val);
  };

  const onRenameHandler = async () => {
    const res = {
      name: settings.name,
      description: settings.description,
      socialAccounts: settings.socialAccounts,
      username: userName,
    };

    await onUpdateSettings(res);
  };

  return (
    <>
      <Stack spacing={5}>
        <PublicProfileSettingsForm
          settings={getFormSettingsValue(settings)}
          onSubmit={(data) => void onUpdateSettings(data)}
        />
        <DangerZoneContainer
          items={[
            {
              type: 'error',
              label: 'Edit username',
              buttonProps: {
                title: 'Change username',
                onClick: () => {
                  void onRenameHandler();
                },
                disabled: !validRenameForm,
              },
              content: (
                <RenameProfileConfirmForm
                  nameIsChanged={(value: string) => {
                    setUserName(value);
                  }}
                  onFormSubmit={() => {
                    void onRenameHandler();
                  }}
                  checkNameIsUnique={nameIsChanged}
                  name={settings.username}
                  isFormValid={(val) => {
                    setValidRenameForm(val);
                  }}
                />
              ),
            },
            {
              type: 'error',
              label: 'Delete this account',
              buttonProps: {
                title: 'Delete this account',
                onClick: () => {
                  setOpenModal(true);
                },
                disabled: !!settings.ownedOrganizations.length,
              },
              content: (
                <div className={classes.dangerZoneContent}>
                  {settings.ownedOrganizations.length ? (
                    <div>
                      <p>
                        Your account is currently an owner in these organizations:{' '}
                        {getOrganizationsString(settings.ownedOrganizations)}
                      </p>
                      <p className="hint">
                        You must remove yourself, transfer ownership, or delete these organizations before you can
                        delete your user profile.
                      </p>
                    </div>
                  ) : (
                    <p className="hint">Once you delete your account, there is no going back. Please be certain!</p>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Stack>
      <ConfirmModal
        title="You’re about to delete your account"
        type="error"
        open={openModal}
        cancelBtnText="I change my mind, go back"
        confirmBtnText="Permanently delete this account"
        disabled={!confirmIsAvailable}
        onClose={() => {
          setOpenModal(false);
        }}
        onConfirm={DeleteProfileHandler}
      >
        <DeleteProfileConfirmForm name={settings.name} email={settings.email} isFormValid={isConfirmFormValid} />
      </ConfirmModal>
    </>
  );
}

export { PublicProfileSettingsContainer };
