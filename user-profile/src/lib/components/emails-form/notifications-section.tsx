import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useFormContext, Controller } from 'react-hook-form';
import { SectionHeader } from 'app-zephyr-components/section-header';
import { useNotificationSectionStyles } from './styles';
import type { FormValues } from '.';
import { useEffect } from 'react';
import { NotificationUpdate } from 'ze-api-contract/user-v2/profile-settings/interfaces';

// TODO: Make Controlled labelled checkbox and select fields shared form components
// to be reused and applied here
export const NotificationsSection = () => {
  const { classes } = useNotificationSectionStyles();
  const { register, watch, setValue, control, formState } = useFormContext<FormValues>();

  const enabled = watch('notificationsActivity.receiveNotifications');
  const selected = watch('notificationsActivity.value');

  useEffect(() => {
    setValue('notificationsActivity.label', NotificationUpdate[selected]);
  }, [selected, setValue]);

  return (
    <Stack>
      <SectionHeader title="Notifications and activity" />
      <div className={classes.container}>
        <Controller
          name="notificationsActivity.receiveNotifications"
          control={control}
          disabled={formState.isSubmitting}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="Send e-mail notifications about Zephyr activity and news"
            />
          )}
        />
        <Stack gap="4px">
          <InputLabel htmlFor="notificationsActivity.value" className={classes.label}>
            Choose the updates you want to receive
          </InputLabel>
          <Controller
            name="notificationsActivity.value"
            control={control}
            disabled={formState.isSubmitting || !enabled}
            render={({ field }) => (
              <Select {...field} displayEmpty className={classes.input}>
                {Object.entries(NotificationUpdate).map(([value, label]) => (
                  <MenuItem value={value} key={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <input hidden {...register('notificationsActivity.label')} />
        </Stack>
        <div className={classes.label}>Keep the track of all Zephyr information</div>
      </div>
    </Stack>
  );
};
