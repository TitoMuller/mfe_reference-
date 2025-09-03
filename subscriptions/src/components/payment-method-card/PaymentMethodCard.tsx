import { useState } from 'react';
import { Box, lighten, Paper, Stack, Typography } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

import { type StripePaymentMethodDto } from 'ze-sdk';

import { Button } from 'app-zephyr-components/Button';
import { AddPaymentMethodModal } from '../add-payment-method-modal';
import { PaymentMethodDetails } from './PaymentMethodDetails';

export const PaymentMethodCard = ({
  paymentMethod,
  disableEdit = false,
  showHeader = true,
  showActions = true,
}: {
  paymentMethod?: StripePaymentMethodDto;
  disableEdit?: boolean;
  showHeader?: boolean;
  showActions?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!showHeader && paymentMethod) {
    return <PaymentMethodDetails paymentMethod={paymentMethod} moreOptions={showActions} />;
  }

  return (
    <Stack sx={{ height: '100%' }}>
      <Paper
        sx={(theme) => ({
          border: theme.palette.border.secondary,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: theme.spacing(2),
          borderRadius: theme.borderRadius.lg,
          gap: theme.spacing(3),
        })}
      >
        {showHeader && (
          <Box sx={(theme) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) })}>
            <Typography variant="h4">Payment method</Typography>
            <Typography sx={(theme) => ({ color: lighten(theme.palette.tx.quarterary, 0.5) })}>
              Change how you pay for your plan.
            </Typography>
          </Box>
        )}

        {paymentMethod ? (
          <PaymentMethodDetails paymentMethod={paymentMethod} moreOptions={showActions} />
        ) : (
          <Box>
            <Button fullWidth variant="outlined" startIcon={<AddOutlined />} onClick={handleOpenModal}>
              Add Payment Method
            </Button>
          </Box>
        )}
      </Paper>

      <AddPaymentMethodModal open={isModalOpen} onClose={handleCloseModal}></AddPaymentMethodModal>
    </Stack>
  );
};
