import { Box, Button, Card, FormControlLabel, Radio, Stack, TextField, Typography } from '@mui/material';
import { SubscriptionNameMap } from 'app-zephyr-constants';
import { clsx } from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { SubscriptionTier } from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';
import { MaxQuantityNonRecurringMetricMap } from '../constants';
import { UnitNumber } from '../ui/UnitNumber';
import { usePlanCardStyles } from './styles';

interface PlanCardProps {
  tier: SubscriptionTier;
}

export function PlanCard({ tier }: PlanCardProps) {
  const { classes } = usePlanCardStyles();
  const { watch, setValue, control, formState } = useFormContext<SubscriptionInputs>();
  const { pricePlanMappings, subscription } = useManageSubscription();

  const selectedCycle = watch('cycle');
  const seatCount = watch('metrics.users');
  const selectedPlan = watch('planType');
  const forcedTier = watch('coupon.data.forcedTier');
  const forcedSeats = watch('coupon.data.forcedSeats');
  const blockedSeats = watch('coupon.data.blockedSeats') ?? false;

  const currentSubscriptionSeats = subscription.quotas.find((q) => q.metric === 'SEATS')?.limit ?? 1;
  const seatsLimit = MaxQuantityNonRecurringMetricMap[tier].SEATS;

  let seatControlsDisabled: boolean;
  switch (tier) {
    case 'PERSONAL':
      seatControlsDisabled = true;
      break;
    case 'PRO':
      seatControlsDisabled = selectedPlan !== tier || !!forcedSeats;
      break;
    case 'ENTERPRISE':
      seatControlsDisabled = selectedPlan !== tier || blockedSeats || !!forcedSeats;
      break;
    case 'TEAM':
      seatControlsDisabled = selectedPlan !== tier || !!forcedSeats;
      break;
  }

  return (
    <Card
      className={clsx(
        classes.card,

        selectedPlan === tier ? classes.cardSelected : classes.cardUnselected,
      )}
      onClick={() => {
        // does not allow changing plan if a forced tier is applied
        if (forcedTier) {
          if (tier !== forcedTier) {
            toast.error('This plan cannot be selected due to an active coupon.');
          }

          return;
        }

        setValue('planType', tier, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // If switching back to current tier, restore the original cycle
        // otherwise, don't change cycle unless its PERSONAL (which requires MONTHLY cycle)
        if (subscription.tier === tier) {
          setValue('cycle', tier === 'PERSONAL' ? 'MONTHLY' : subscription.cycle, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        // Set the number of seats based on the current plan
        setValue('metrics.users', forcedSeats ?? Math.min(seatCount, seatsLimit), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }}
    >
      <FormControlLabel
        className={clsx(classes.formControlLabel, forcedTier ? classes.cardDisabled : classes.cardEnabled)}
        value={tier}
        control={<Radio color="success" disabled={!!forcedTier} />}
        label={
          <Box className={classes.labelContainer}>
            <Typography variant="h6">{SubscriptionNameMap[tier]}</Typography>
            {subscription.tier === tier && (
              <Typography variant="body2" color="text.secondary">
                (Active now)
              </Typography>
            )}
          </Box>
        }
      />
      <Box
        className={clsx(
          classes.contentSection,
          tier !== 'PERSONAL' ? classes.contentSectionSpaceBetween : classes.contentSectionFlexStart,
          selectedPlan === tier ? classes.contentSectionSelected : classes.contentSectionUnselected,
        )}
      >
        <Stack>
          <Typography variant="h4">
            {tier === 'PERSONAL' ? (
              'Free'
            ) : (
              <UnitNumber
                price
                nocolor
                value={pricePlanMappings[`${tier}_${selectedCycle}`].seatPrice / (selectedCycle === 'MONTHLY' ? 1 : 12)}
                unit="editor/mo"
              />
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {seatsLimit === 1 ? 'Single user only' : `Up to ${seatsLimit.toString()} users`}
          </Typography>
        </Stack>

        {tier !== 'PERSONAL' && (
          <Box className={classes.userControlsContainer}>
            <Box className={classes.userControlsBox}>
              <Box className={classes.userControlsRow}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  disabled={seatControlsDisabled}
                  className={clsx(classes.controlButton, seatCount <= 1 && classes.cursorHoverNotAllowed)}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (seatCount <= 1) {
                      return;
                    }

                    if (blockedSeats || forcedSeats) {
                      toast.error('Number of seats cannot be decreased due to an active coupon.');
                      return;
                    }

                    setValue('metrics.users', seatCount - 1, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  -
                </Button>

                <Controller
                  name="metrics.users"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      value={selectedPlan === tier ? field.value : currentSubscriptionSeats}
                      error={!!fieldState.error}
                      disabled={seatControlsDisabled || selectedPlan !== tier}
                      className={classes.numberInput}
                      size="small"
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      slotProps={{
                        input: {
                          className: classes.numberInputProps,
                          inputProps: { min: 1, max: seatsLimit },
                        },
                      }}
                      onChange={(e) => {
                        if (blockedSeats || forcedSeats) {
                          return;
                        }

                        const inputValue = e.target.value;

                        // On remove or empty set to 1
                        if (!inputValue) {
                          return;
                        }

                        const numericValue = parseInt(inputValue, 10);

                        // On invalid numbers, set to 1
                        if (isNaN(numericValue)) {
                          field.onChange(1);
                          return;
                        }

                        // Define field value within bounds
                        field.onChange(Math.min(seatsLimit, Math.max(1, numericValue)));
                      }}
                    />
                  )}
                />

                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  disabled={seatControlsDisabled}
                  className={clsx(classes.controlButton, seatCount >= seatsLimit && classes.cursorHoverNotAllowed)}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (seatCount >= seatsLimit) {
                      if (tier === 'PRO') {
                        toast.error(`Please contact sales if more than ${seatsLimit.toString()} seats is needed.`);
                      } else {
                        toast.error(
                          `${SubscriptionNameMap[tier]} plan only allows up to ${seatsLimit.toString()} users.`,
                        );
                      }

                      return;
                    }

                    if (blockedSeats || forcedSeats) {
                      toast.error('Number of seats cannot be increased due to an active coupon.');
                      return;
                    }

                    setValue('metrics.users', seatCount + 1, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  +
                </Button>
              </Box>

              {formState.errors.metrics?.users && (
                <Typography variant="caption" color="error">
                  {formState.errors.metrics.users.message}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
