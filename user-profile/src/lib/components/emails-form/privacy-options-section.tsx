import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SectionHeader } from 'app-zephyr-components/section-header';
import { useMainStyles } from './styles';
import { useFormContext, Controller } from 'react-hook-form';
import type { FormValues } from '.';

// TODO: Make Controlled and labelled checkbox shared form components
// to be reused and applied here
export const PrivacyOptionsSection = () => {
  const { classes } = useMainStyles();
  const { control, formState } = useFormContext<FormValues>();

  return (
    <Stack>
      <SectionHeader title="Privacy options" />
      <div className={classes.container}>
        <Controller
          name="privacyOptions.isPrivate"
          control={control}
          disabled={formState.isSubmitting}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="Keep my e-mail address private"
            />
          )}
        />
      </div>
    </Stack>
  );
};
