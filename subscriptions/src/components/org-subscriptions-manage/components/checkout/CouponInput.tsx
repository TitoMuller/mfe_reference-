import { Close } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
// import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CouponDto, getCoupon } from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';

export const CouponInput = ({
  canUpdateCoupon,
}: {
  currentCouponData: CouponDto | undefined;
  currentCouponCode: string | undefined;
  canUpdateCoupon: boolean;
}) => {
  const { watch, control, setValue } = useFormContext<SubscriptionInputs>();
  const { subscription } = useManageSubscription();
  const formCouponCode = watch('coupon.code');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [fromUrlParam, setFromUrlParam] = useState(false);
  const alreadyApplied = watch('coupon.alreadyApplied');

  // Check for URL query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const couponFromUrl = urlParams.get('coupon');

    if (couponFromUrl && !formCouponCode && !alreadyApplied) {
      setValue('coupon.code', couponFromUrl, { shouldValidate: true, shouldDirty: true });
      setFromUrlParam(true);

      // Auto-apply the coupon from URL
      const applyCouponFromUrl = async () => {
        try {
          setCouponError('');
          const getCouponResponse = await getCoupon({ coupon: couponFromUrl });
          if (getCouponResponse.status !== 200) {
            setCouponError('Invalid coupon from URL');
            return;
          }
          const fetchedCouponData = getCouponResponse.data;
          if (!fetchedCouponData) {
            setCouponError('Invalid coupon from URL');
            return;
          }
          setCouponApplied(true);
          setValue('coupon.data', fetchedCouponData);

          if (fetchedCouponData.forcedSeats) {
            setValue('metrics.users', fetchedCouponData.forcedSeats, { shouldValidate: true, shouldDirty: true });
          }

          if (fetchedCouponData.forcedTier) {
            setValue('planType', fetchedCouponData.forcedTier, { shouldValidate: true, shouldDirty: true });
          }

          if (fetchedCouponData.forcedCycle) {
            setValue('cycle', fetchedCouponData.forcedCycle, { shouldValidate: true, shouldDirty: true });
          }
        } catch (error) {
          setCouponError(error instanceof Error ? error.message : 'Error applying coupon from URL');
          setCouponApplied(false);
          setFromUrlParam(false);
        }
      };

      void applyCouponFromUrl();
    }
  }, [setValue, formCouponCode, alreadyApplied]);

  const handleApplyCoupon = async () => {
    if (!formCouponCode) return;

    // Clear any existing error state when trying to apply a new coupon
    setCouponError('');

    try {
      const getCouponResponse = await getCoupon({ coupon: formCouponCode });
      if (getCouponResponse.status !== 200) {
        setCouponError('Invalid coupon');
        return;
      }
      const fetchedCouponData = getCouponResponse.data;
      if (!fetchedCouponData) {
        setCouponError('Invalid coupon');
        return;
      }
      setCouponApplied(true);
      setValue('coupon.data', fetchedCouponData);

      if (fetchedCouponData.forcedSeats) {
        setValue('metrics.users', fetchedCouponData.forcedSeats, { shouldValidate: true, shouldDirty: true });
      }

      if (fetchedCouponData.forcedTier) {
        setValue('planType', fetchedCouponData.forcedTier, { shouldValidate: true, shouldDirty: true });
      }

      if (fetchedCouponData.forcedCycle) {
        setValue('cycle', fetchedCouponData.forcedCycle, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Error applying coupon');
      setCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    // Don't allow removal of URL-applied coupons
    if (fromUrlParam) {
      return;
    }

    const currentCouponData = watch('coupon.data');

    // If the coupon had a forcedTier, revert to current subscription tier
    if (currentCouponData?.forcedTier) {
      setValue('planType', subscription.tier, { shouldValidate: true, shouldDirty: true });
    }

    // If the coupon had forcedSeats, revert to current subscription seat count
    if (currentCouponData?.forcedSeats) {
      const currentSeats = subscription.quotas.find((q) => q.metric === 'SEATS')?.limit ?? 1;
      setValue('metrics.users', currentSeats, { shouldValidate: true, shouldDirty: true });
    }

    // If the coupon had forcedCycle, revert to current subscription cycle
    if (currentCouponData?.forcedCycle) {
      setValue('cycle', subscription.cycle, { shouldValidate: true, shouldDirty: true });
    }

    // Special case: If tier is reverting to PERSONAL (or was already PERSONAL),
    // ensure cycle is MONTHLY since PERSONAL tier doesn't support yearly billing
    const finalTier = currentCouponData?.forcedTier ? subscription.tier : watch('planType');
    if (finalTier === 'PERSONAL') {
      setValue('cycle', 'MONTHLY', { shouldValidate: true, shouldDirty: true });
    }

    setValue('coupon.code', '', { shouldValidate: true, shouldDirty: true });
    setValue('coupon.data', undefined, { shouldValidate: true, shouldDirty: true });
    setValue('coupon.alreadyApplied', false, { shouldValidate: true, shouldDirty: true });
    setCouponApplied(false);
    setCouponError('');
    setFromUrlParam(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Discount Code
      </Typography>
      <Box>
        <Controller
          control={control}
          name="coupon.code"
          render={({ field: { onChange, name, value } }) => (
            <TextField
              onChange={(e) => {
                onChange(e);
                if (e.target.value.trim() === '') {
                  setValue('coupon.data', undefined);
                  setCouponApplied(false);
                } else {
                  // Clear error when user starts typing a new coupon
                  setCouponError('');
                }
              }}
              name={name}
              value={value || ''}
              fullWidth
              size="small"
              placeholder="Enter discount code"
              sx={{ bgcolor: 'background.paper' }}
              slotProps={{
                input: {
                  endAdornment: fromUrlParam ? undefined : (
                    <InputAdornment position="end">
                      {couponApplied || alreadyApplied ? (
                        <IconButton
                          size="small"
                          aria-label="remove coupon"
                          onClick={handleRemoveCoupon}
                          disabled={canUpdateCoupon || fromUrlParam}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      ) : (
                        <Button
                          variant="text"
                          size="small"
                          aria-label="apply coupon to price"
                          onClick={() => void handleApplyCoupon()}
                          disabled={canUpdateCoupon || alreadyApplied}
                        >
                          Apply
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                },
              }}
              error={!!couponError}
              helperText={couponError}
              disabled={canUpdateCoupon || fromUrlParam || alreadyApplied}
            />
          )}
        />
      </Box>
      {!fromUrlParam && (couponApplied || alreadyApplied) && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          Coupon applied successfully!
        </Typography>
      )}
    </Box>
  );
};
