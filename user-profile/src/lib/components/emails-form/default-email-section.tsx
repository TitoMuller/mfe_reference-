import type { ProfileSettingsEmailOptions } from 'ze-api-contract/user-v2/profile-settings/interfaces';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useDefaultEmailStyles } from './styles';
import { useSendEmailVerification } from 'app-zephyr-domains/user';

interface Props {
  emailOptions: ProfileSettingsEmailOptions;
}

export const DefaultEmailSection = ({ emailOptions }: Props) => {
  const { classes } = useDefaultEmailStyles();
  const { mutateAsync: sendVerification, isPending } = useSendEmailVerification();

  const onSendVerification = async () => {
    await sendVerification();
  };

  return (
    <div className={classes.defaultEmailContainer}>
      {!emailOptions.emailIsVerified && (
        <Button
          variant="text"
          color="primary"
          sx={{ padding: 0 }}
          disabled={isPending}
          onClick={() => {
            void onSendVerification();
          }}
        >
          Verify e-mail {isPending && <CircularProgress size={18} sx={{ marginLeft: '8px' }} />}
        </Button>
      )}
      <ul className={classes.emailItems}>
        <li>
          Visible in e-mails
          <br />
          <span className={classes.emailSubItem}>
            This email will be used as the 'author' or 'committer' address for Zephyr operations
          </span>
        </li>
        <li>
          Receives notifications <br />
          <span className={classes.emailSubItem}>This e-mail address is the default used for Zephyr notifications</span>
        </li>
      </ul>
    </div>
  );
};
