import { Box, Typography, Grid2 as Grid, Stack } from '@mui/material';
import { AddPaymentMethodModal, AddPaymentMethodModalContent } from '../../../add-payment-method-modal';
import { PaymentMethodDetails } from '../../../payment-method-card';
import { getGetDefaultPaymentMethodQueryKey, getListPaymentMethodsQueryKey, StripePaymentMethodDto } from 'ze-sdk';
import { Button } from 'app-zephyr-components/Button';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTypedParams } from 'app-zephyr-routes';

export const PaymentMethodTab = ({ paymentMethods }: { paymentMethods?: StripePaymentMethodDto[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { organization } = useTypedParams();
  const queryClient = useQueryClient();
  if (!organization) {
    throw new Error('Organization name is required');
  }
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Box sx={{ pb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Stack>
          <Typography>Payment Method</Typography>
          <Typography variant="body2" color="textDisabled">
            Manage your billing and payment details.
          </Typography>
        </Stack>
        <Button onClick={handleOpenModal} startIcon={<Add />}>
          Add Payment Method
        </Button>
      </Box>

      {paymentMethods?.length === 0 || !paymentMethods ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
          No payment methods found
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {paymentMethods.map((method) => (
            <Grid key={method.id} size={{ sm: 12, md: 6 }}>
              <PaymentMethodDetails key={method.id} paymentMethod={method} moreOptions />
            </Grid>
          ))}
        </Grid>
      )}
      <AddPaymentMethodModal open={isModalOpen} onClose={handleCloseModal}>
        <AddPaymentMethodModalContent
          defaultLocked={false}
          handleClose={() => {
            void queryClient.refetchQueries({
              queryKey: getListPaymentMethodsQueryKey({ organizationName: organization }),
            });
            void queryClient.refetchQueries({
              queryKey: getGetDefaultPaymentMethodQueryKey({ organizationName: organization }),
            });
            handleCloseModal();
          }}
        />
      </AddPaymentMethodModal>
    </>
  );
};
