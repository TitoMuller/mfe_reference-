import {
  NotificationUpdate,
  type ProfileSettingsEmailOptions,
  type ProfileSettingsEmailOptionsBodyReq,
} from 'ze-api-contract/user-v2/profile-settings/interfaces';
import Stack from '@mui/material/Stack';
import { useForm, FormProvider } from 'react-hook-form';
import { useMainStyles } from './styles';
import { useSaveEmailsSettings } from 'app-zephyr-domains/user';
import { useEffect, useState } from 'react';
import { DefaultEmailSection } from './default-email-section';
import { ConfirmModal } from 'app-zephyr-components/confirm-modal';
import { PillTag } from 'app-zephyr-components/pill-tag';

interface Props {
  emailOptions: ProfileSettingsEmailOptions;
}

export type FormValues = ProfileSettingsEmailOptionsBodyReq;

export const EmailsForm = ({ emailOptions }: Props) => {
  const defaultValues = {
    additionalEmails: emailOptions.additionalEmails ?? [],
    privacyOptions: emailOptions.privacyOptions ?? { isPrivate: false },
    notificationsActivity: emailOptions.notificationsActivity ?? {
      value: 'daily',
      label: NotificationUpdate.daily,
      receiveNotifications: false,
    },
  };
  const { classes } = useMainStyles();
  const { mutateAsync: saveOptions } = useSaveEmailsSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formMethods = useForm<FormValues>({ defaultValues });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitSuccessful },
  } = formMethods;

  const onSubmit = handleSubmit(async (data) => {
    await saveOptions(data);
  });

  useEffect(() => {
    reset({}, { keepValues: true, keepDirtyValues: false, keepDefaultValues: false });
  }, [isSubmitSuccessful, reset]);

  const Verified = () => <PillTag type="success" label="Default" />;
  const NotVerified = () => <PillTag type="error" label="Not verified" />;

  // TODO: disabled until the flow will be working
  // const additionalEmails = watch('additionalEmails');

  // const isEqualEmails = (defaultEmails: string[], newEmails: string[]) => {
  //   if (defaultEmails.length !== newEmails.length) return false;

  //   for (const email of newEmails) {
  //     if (!defaultEmails.includes(email)) return false;
  //   }

  //   return true;
  // };

  // const equalEmails = isEqualEmails(emailOptions.additionalEmails ?? [], additionalEmails ?? []);

  return (
    <Stack
      component="form"
      gap="16px"
      maxWidth={'690px'}
      onSubmit={(value) => {
        void onSubmit(value);
      }}
    >
      {/* TODO: it should be implemented at the app-zephyr-forms */}
      <FormProvider {...formMethods}>
        <Stack direction={'row'} gap={'8px'}>
          {emailOptions.defaultEmail} - {emailOptions.emailIsVerified ? <Verified /> : <NotVerified />}
        </Stack>
        <div className={classes.container}>
          <DefaultEmailSection emailOptions={emailOptions} />
          {/* TODO: disabled until the flow will be working */}
          {/* <AdditionalEmailsSection /> */}
        </div>
        {/* TODO: Add these options as soon as the features are ready to be implemented */}
        {/* <PrivacyOptionsSection />
        <NotificationsSection /> */}
        {/* TODO: disabled until the flow will be working */}
        {/* <div className={classes.formButtons}>
          <Button
            variant="text"
            type="button"
            disabled={isSubmitting || equalEmails}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || equalEmails}
            sx={{ minWidth: '140px' }}
            className={classes.confirmBtn}
          >
            {isSubmitting ? <CircularProgress color="secondary" size={24} /> : 'Save changes'}
          </Button>
        </div> */}
      </FormProvider>
      <ConfirmModal
        onConfirm={() => {
          reset(defaultValues, { keepDirty: false });
          setIsModalOpen(false);
        }}
        open={isModalOpen}
        title="Are you sure you want to discard your changes?"
        confirmBtnText="Yes, discard"
        type="warning"
        extraClasses={classes.modal}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </Stack>
  );
};
