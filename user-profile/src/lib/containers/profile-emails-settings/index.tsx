import { Error } from 'app-zephyr-components/AlertContent';
import { useEmailOptions } from 'app-zephyr-domains/user';
import { EmailsForm } from '../../components/emails-form';
import { EmailsFormSkeleton } from '../../components/emails-form/emails-form-skeleton';

export const ProfileEmailsSettingsContainer = () => {
  const { error, isLoading, emailOptions } = useEmailOptions();

  if (isLoading) return <EmailsFormSkeleton />;
  if (error ?? !emailOptions) return <Error error={error} />;

  return <EmailsForm emailOptions={emailOptions} />;
};
