import { Close } from '@mui/icons-material';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { StripePaymentMethodForm } from 'app-zephyr-forms';
import { useTypedParams } from 'app-zephyr-routes';
import { useState } from 'react';
import {
  AttachPaymentMethodParams,
  getGetDefaultPaymentMethodQueryKey,
  getListPaymentMethodsQueryKey,
  useAttachPaymentMethod,
  useSetDefaultPaymentMethod,
} from 'ze-sdk';
import { useStyles } from './styles';

export interface AddPaymentMethodModalContentProps {
  handleClose: (params?: AttachPaymentMethodParams) => void;
  onSubmit?: (params: AttachPaymentMethodParams) => void;
  defaultLocked?: boolean;
  defaultValues?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export const AddPaymentMethodModalContent: React.FC<AddPaymentMethodModalContentProps> = ({
  handleClose,
  onSubmit,
  defaultLocked = true,
  defaultValues,
}) => {
  const { classes } = useStyles();
  const { organization: organizationName } = useTypedParams();
  if (!organizationName) {
    throw new Error('Organization name is not defined');
  }
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate: setDefaultPaymentMethodMutation } = useSetDefaultPaymentMethod({
    mutation: {
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: [getGetDefaultPaymentMethodQueryKey({ organizationName })],
        });
        void queryClient.refetchQueries({
          queryKey: getGetDefaultPaymentMethodQueryKey({ organizationName }),
        });
      },
    },
  });
  // Setup mutation
  const { mutateAsync: attachPaymentMethod } = useAttachPaymentMethod({
    mutation: {
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: getListPaymentMethodsQueryKey({ organizationName }),
        });
        void queryClient.refetchQueries({
          queryKey: getListPaymentMethodsQueryKey({ organizationName }),
        });
      },
    },
  });

  const handleSubmit = async (params: AttachPaymentMethodParams) => {
    try {
      setError(null);
      const result = await attachPaymentMethod({
        params,
        pathParams: { organizationName },
      });

      if (params.useAsDefault) {
        setDefaultPaymentMethodMutation({
          params: { paymentMethodId: params.paymentMethodId },
          pathParams: { organizationName: organizationName },
        });
      }

      if (onSubmit) {
        onSubmit(params);
      }
      handleClose(params);
      return result;
    } catch (err) {
      setError('Failed to add payment method. Please try again.');
      throw err;
    }
  };

  return (
    <Stack className={classes.root}>
      <Paper className={classes.paper} sx={{ position: 'relative', overflow: 'visible' }}>
        <Box className={classes.header}>
          <Typography className={classes.title} variant="body1">
            Add Payment Method
          </Typography>
          <IconButton
            onClick={() => {
              handleClose();
            }}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" className={classes.description}>
          Add a new payment method to your account.
        </Typography>

        <Box className={classes.content}>
          {error && (
            <Typography color="error" className={classes.error}>
              {error}
            </Typography>
          )}

          <StripePaymentMethodForm
            //TODO: Fix defaults
            // defaultValues={defaultValues}
            onSubmitValidData={handleSubmit}
            setAsDefaultLocked={defaultLocked}
          />
        </Box>
      </Paper>
    </Stack>
  );
};
