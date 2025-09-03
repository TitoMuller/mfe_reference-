import { MoreVert } from '@mui/icons-material';
import { Box, Typography, Menu, MenuItem, Grid2 as Grid, IconButton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useTypedParams } from 'app-zephyr-routes';
import { useState, useMemo } from 'react';
import {
  StripePaymentMethodDto,
  useGetDefaultPaymentMethod,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod,
  getGetDefaultPaymentMethodQueryKey,
  getListPaymentMethodsQueryKey,
} from 'ze-sdk';
import { tokens } from 'app-zephyr-styles/themes';
import { CardIcon } from './CardIcon';
import { ConfirmationModal } from 'app-zephyr-components/ConfirmationModal';

export const PaymentMethodDetails = ({
  paymentMethod,
  moreOptions = false,
}: {
  paymentMethod: StripePaymentMethodDto;
  moreOptions?: boolean;
}) => {
  const { organization } = useTypedParams();
  const queryClient = useQueryClient();

  if (!organization) {
    throw new Error('Unable to find organization');
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removingPaymentMethodId, setRemovingPaymentMethodId] = useState<string | null>(null);

  const { data: defaultPaymentMethod } = useGetDefaultPaymentMethod({
    organizationName: organization,
  });

  const isDefaultPaymentMethod = useMemo(() => {
    if (!defaultPaymentMethod?.data) {
      return false;
    }
    if (defaultPaymentMethod.data.id === paymentMethod.id) {
      return true;
    }
    return false;
  }, [defaultPaymentMethod?.data, paymentMethod.id]);

  const { mutate: detachPaymentMethodMutation } = useDetachPaymentMethod();
  const { mutate: setDefaultPaymentMethodMutation } = useSetDefaultPaymentMethod();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openRemoveModal = (paymentMethodId: string) => {
    setRemovingPaymentMethodId(paymentMethodId);
    setIsRemoveModalOpen(true);
    handleMenuClose();
  };

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setRemovingPaymentMethodId(null);
  };

  const handleRemove = ({ paymentMethodId }: { paymentMethodId: string }) => {
    detachPaymentMethodMutation(
      { params: { paymentMethodId }, pathParams: { organizationName: organization } },
      {
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: getListPaymentMethodsQueryKey({ organizationName: organization }),
          });
          void queryClient.invalidateQueries({
            queryKey: getGetDefaultPaymentMethodQueryKey({ organizationName: organization }),
          });
        },
      },
    );
    closeRemoveModal();
  };

  // Set as default payment method
  const handleSetDefault = ({ paymentMethodId }: { paymentMethodId: string }) => {
    setDefaultPaymentMethodMutation(
      {
        params: { paymentMethodId },
        pathParams: { organizationName: organization },
      },
      {
        onSettled: () => {
          (async () => {
            await queryClient.invalidateQueries({
              queryKey: getGetDefaultPaymentMethodQueryKey({ organizationName: organization }),
            });
            await queryClient.invalidateQueries({
              queryKey: getListPaymentMethodsQueryKey({ organizationName: organization }),
            });
          })().catch((e: unknown) => {
            if (e instanceof Error) {
              throw new Error(`Failed to invalidate queries,${e.message}`);
            } else {
              throw new Error('Failed to invalidate queries');
            }
          });
        },
      },
    );
    handleMenuClose();
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }}>
      <Grid
        spacing={2}
        container
        data-e2e="payment-method-card"
        sx={(theme) => ({
          paddingX: 1,
          paddingY: 2,
          backgroundColor: tokens['midnight-950'],
          border: theme.palette.border.secondary,
          borderRadius: theme.borderRadius.lg,
        })}
      >
        <Grid size={{ xs: 'auto', sm: 2 }} sx={{ display: 'flex', alignItems: 'center', minWidth: '40px' }}>
          <CardIcon brand={paymentMethod.card?.brand} />
        </Grid>
        <Grid size={'grow'}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }} data-e2e="payment-method-brand">
                {paymentMethod.card?.brand} ending in {paymentMethod.card?.last4}
              </Typography>
              <Typography variant="body2" data-e2e="payment-method-expiry">
                Expires on {paymentMethod.card?.exp_month.toString().padStart(2, '0')}/{paymentMethod.card?.exp_year}
              </Typography>
            </Box>
            {isDefaultPaymentMethod && (
              <Typography
                data-e2e="default-payment-method-badge"
                sx={(theme) => ({
                  backgroundColor: tokens['midnight-900'],
                  opacity: 0.8,
                  px: theme.spacing(0.5),
                  py: theme.spacing(0.25),
                  borderRadius: theme.borderRadius.md,
                  color: theme.palette.tx.primary,
                  border: theme.palette.border.tertiary,
                })}
                variant="body2"
              >
                Default
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid size={'auto'} sx={{ display: 'flex', alignItems: 'center' }}>
          {moreOptions && !isDefaultPaymentMethod && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: 'white', ml: 1 }}
                data-e2e="payment-method-more-options"
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                data-e2e="payment-method-menu"
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'black',
                      color: 'white',
                      '& .MuiMenuItem-root': {
                        fontSize: '14px',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleSetDefault({ paymentMethodId: paymentMethod.id });
                  }}
                  data-e2e="set-default-payment-method"
                >
                  Set as default
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    openRemoveModal(paymentMethod.id);
                  }}
                  sx={{ color: '#ff4d4f' }}
                  data-e2e="remove-payment-method"
                >
                  Remove
                </MenuItem>
              </Menu>
            </>
          )}
        </Grid>
      </Grid>

      {paymentMethod.card && (
        <ConfirmationModal
          title="Are you sure you want to remove this payment method?"
          description={`This will remove the ${paymentMethod.card.brand} card ending in ${paymentMethod.card.last4} from your account.`}
          type="error"
          confirmBtnText="Remove Payment Method"
          open={isRemoveModalOpen}
          onConfirm={() => {
            if (removingPaymentMethodId) {
              handleRemove({ paymentMethodId: removingPaymentMethodId });
            }
          }}
          onClose={closeRemoveModal}
          data-e2e="remove-payment-method-modal"
        />
      )}
    </Box>
  );
};
