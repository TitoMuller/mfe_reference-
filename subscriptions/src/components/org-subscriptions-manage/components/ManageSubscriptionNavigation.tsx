import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Modal, Stack, Typography } from '@mui/material';
import { Link, useBlocker } from '@tanstack/react-router';
import { Button } from 'app-zephyr-components/Button';
import { organization_subscription_path, useTypedParams } from 'app-zephyr-routes';
import { useFormContext } from 'react-hook-form';
import { SubscriptionInputs } from '../ManageSubscriptionProvider';
import { SubscriptionChangeType, useSubscriptionChangeCalculator } from '../hooks/useSubscriptionChangeCalculator';

export const ManageSubscriptionNavigation = () => {
  const { organization } = useTypedParams();
  if (!organization) {
    throw new Error('Organization not found');
  }
  const {
    formState: { isSubmitting },
  } = useFormContext<SubscriptionInputs>();
  const { changeType } = useSubscriptionChangeCalculator();
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => changeType !== SubscriptionChangeType.NONE && !isSubmitting,
    enableBeforeUnload: false,
    withResolver: true,
  });

  return (
    <>
      <Link to={organization_subscription_path({ organization: { name: organization } })}>
        <IconButton
          sx={(theme) => ({
            color: theme.palette.tx.white,
          })}
          size="small"
        >
          <ArrowBack sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Link>
      <Modal open={status === 'blocked'}>
        <Stack
          direction="column"
          sx={(theme) => ({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: theme.palette.border.secondary,
            boxShadow: 24,
            p: 4,
          })}
        >
          <Box sx={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
            <Box>
              <Typography variant="h6">Are you sure you want to leave?</Typography>
              <Typography variant="subtitle2">You have unsaved changes.</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button color="error" onClick={proceed}>
                Leave
              </Button>
              <Button color="secondary" onClick={reset}>
                Stay
              </Button>
            </Box>
          </Box>
        </Stack>
      </Modal>
    </>
  );
};
