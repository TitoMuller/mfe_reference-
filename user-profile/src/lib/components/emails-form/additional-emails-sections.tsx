import { useFormContext } from 'react-hook-form';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import type { FormValues } from '.';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useAdditionalEmailsStyles } from './styles';
import { useMakeEmailDefault } from 'app-zephyr-domains/user';
import { schema } from 'ze-api-contract/user-v2/profile-settings/set-default-email';

export const AdditionalEmailsSection = () => {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const { mutateAsync: makeEmailDefault, isPending } = useMakeEmailDefault();
  const { classes } = useAdditionalEmailsStyles();
  const {
    register,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<FormValues>();
  const additionalEmails = watch('additionalEmails') ?? [];

  const onAddEmail = () => {
    if (!newEmail) return;
    setValue('additionalEmails', [...additionalEmails, newEmail], { shouldDirty: true });
    setNewEmail('');
  };

  const onRemoveEmail = (email: string) => {
    const tempArray = [...additionalEmails];
    const index = tempArray.indexOf(email);
    tempArray.splice(index, 1);
    setValue('additionalEmails', tempArray, { shouldDirty: true });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value;
    setNewEmail(inputEmail);
    const test = schema.extract('email').validate(inputEmail);

    if (test.error) {
      setEmailError('Invalid e-mail address');
      return;
    }

    setEmailError(undefined);
  };

  const onMakeDefault = async (email: string) => {
    await makeEmailDefault(email);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code !== 'Enter') return;
    e.preventDefault();
    onAddEmail();
  };

  return (
    <>
      <input hidden {...register(`additionalEmails`)} />
      {additionalEmails.map((email, index) => (
        <div key={email + index.toString()}>
          <div>
            {email} - <span className={classes.additional}>Additional</span>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
          <input hidden {...register(`additionalEmails.${index}`)} value={email} />
          <div className={classes.emailsActions}>
            <Button
              variant="text"
              color="primary"
              sx={{ padding: 0 }}
              onClick={() => {
                void onMakeDefault(email);
              }}
              disabled={isSubmitting || isPending}
            >
              Make default e-mail {isPending && <CircularProgress size={12} thickness={7} sx={{ marginLeft: 1 }} />}
            </Button>
            <Button
              variant="text"
              color="error"
              sx={{ padding: 0 }}
              disabled={isSubmitting}
              onClick={() => {
                onRemoveEmail(email);
              }}
            >
              Remove address
            </Button>
          </div>
        </div>
      ))}
      <div className={classes.inputContainer}>
        <label htmlFor="email" className={classes.emailInputLabel}>
          Additional e-mail address
        </label>
        {/* TODO: Fix error styles for the Input on the app-zephyr-form lib to be used here
          This component does not need to be controlled so that's why FormInput is not being used here */}
        <TextField
          id="email"
          name="email"
          className={classes.input}
          type="email"
          placeholder="example@mail.com"
          value={newEmail}
          disabled={isSubmitting}
          onChange={onChange}
          onKeyDown={onKeyDown}
          error={Boolean(emailError)}
          helperText={emailError}
        />
        <Button
          variant="text"
          color="primary"
          sx={{ padding: 0, fontSize: 14, width: 'auto' }}
          disabled={isSubmitting || Boolean(emailError) || !newEmail.length}
          onClick={onAddEmail}
        >
          Add e-mail
        </Button>
      </div>
    </>
  );
};
