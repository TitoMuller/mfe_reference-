import {
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ScheduleReasonMap } from 'app-zephyr-constants';
import { organization_subscription_path } from 'app-zephyr-routes';
import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getGetSubscriptionQueryKey, ScheduleReason, SubscriptionTier, useCancelDowngrade } from 'ze-sdk';
import { useOverageCalculations } from '../../hooks/useOverageCalculations';
import { SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';
import { formatPenniesToPriceNumber } from '../../money-functions/money';
import { UnitNumber } from '../ui/UnitNumber';
import { CheckoutButton } from './CheckoutButton';
import { CouponInput } from './CouponInput';
import { useCheckoutStyles } from './styles';
import { SubscriptionChangeIndicator } from './SubscriptionChangeIndicator';

export const CheckoutComponent = () => {
  const { classes } = useCheckoutStyles();
  const { watch, setValue } = useFormContext<SubscriptionInputs>();
  const { planCostData, pricePlanMappings, subscription, organizationName } = useManageSubscription();
  const { mutate: cancelDowngrade } = useCancelDowngrade();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // subscription data
  const subscriptionCouponData = subscription.coupon;
  // Form values
  const formPlanType = watch('planType');
  const formCouponData = watch('coupon.data');
  const formCouponCode = watch('coupon.code');
  const formCycle = watch('cycle');
  const formAddonDeployPercent = watch('metrics.deploys');
  const formSeats = watch('metrics.users');
  const formPaymentMethod = watch('paymentMethod');
  const formDeployOverageEnabled = watch('overages.deploys.overageType');

  // Determine if billing cycle selection is disabled
  const hasScheduledChange = !!subscription.scheduledTier && !!subscription.scheduleReason;
  const isCycleForced = !!formCouponData?.forcedCycle;
  const isBillingCycleDisabled = formPlanType === subscription.tier || hasScheduledChange || isCycleForced;

  // Use the consolidated overage calculations hook
  const currentPlanMapping = pricePlanMappings[`${formPlanType}_${formCycle}`];
  const overageCalculations = useOverageCalculations(currentPlanMapping);

  // Calculate the extra deployment cost using the hook
  const addonDeploymentPriceInPennies = overageCalculations.calculateAddonDeploymentPriceInPennies(
    formDeployOverageEnabled,
    formAddonDeployPercent,
  );

  const couponData = subscriptionCouponData ?? formCouponData;
  const couponCode = subscriptionCouponData?.stripeCouponId ?? formCouponCode;

  // Get the cost per 100 deployments for display
  const { costPerDeployment } = overageCalculations.getPlanValues();

  const calculateTotal = () => {
    let total = 0;
    let totalWithoutDiscount = 0;
    if (formPlanType === 'PERSONAL') {
      total = 0;
    } else {
      total += planCostData.seatPrice * formSeats;
      totalWithoutDiscount = total;
    }
    if (couponData) {
      if (couponData.percentOff) {
        total *= 1 - couponData.percentOff / 100;
      }
      if (couponData.amountOff) {
        total -= couponData.amountOff;
      }
    }

    total = Math.max(total, 0);

    return { total, totalWithoutDiscount, difference: totalWithoutDiscount - total };
  };

  const { total, difference } = calculateTotal();

  // Check if there's a scheduled downgrade
  const hasScheduledDowngrade = !!subscription.scheduledTier && !!subscription.scheduleReason;

  // If there's a scheduled downgrade, show that state instead
  if (hasScheduledDowngrade) {
    return (
      <Box className={classes.stickyContainer}>
        <Typography variant="h5" className={classes.title}>
          Scheduled Change:
        </Typography>

        <Box
          className={clsx(
            classes.scheduledChangeBox,
            subscription.scheduleReason === ScheduleReason.PAYMENT_FAILED
              ? classes.scheduledChangeBoxPaymentFailed
              : classes.scheduledChangeBoxWarning,
          )}
        >
          <Typography
            variant="h6"
            className={clsx(
              classes.scheduledChangeTitle,
              subscription.scheduleReason === ScheduleReason.PAYMENT_FAILED
                ? classes.scheduledChangeTitlePaymentFailed
                : classes.scheduledChangeTitleWarning,
            )}
          >
            Downgrade Scheduled
          </Typography>
          <Typography
            variant="body2"
            className={clsx(
              classes.scheduledChangeDescription,
              subscription.scheduleReason === ScheduleReason.PAYMENT_FAILED
                ? classes.scheduledChangeDescriptionPaymentFailed
                : classes.scheduledChangeDescriptionWarning,
            )}
          >
            Your subscription will change to <strong>{subscription.scheduledTier}</strong> on{' '}
            <strong>{new Date(subscription.nextBillingAt || '').toLocaleDateString()}</strong>
          </Typography>
          <Typography
            variant="body2"
            className={clsx(
              classes.scheduledChangeReason,
              subscription.scheduleReason === ScheduleReason.PAYMENT_FAILED
                ? classes.scheduledChangeReasonPaymentFailed
                : classes.scheduledChangeReasonWarning,
            )}
          >
            {subscription.scheduleReason ? ScheduleReasonMap[subscription.scheduleReason] : 'Scheduled for review'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          className={classes.cancelButton}
          onClick={() => {
            cancelDowngrade({ pathParams: { organizationName } });
            toast.success('Downgrade cancelled');
            void queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey({ organizationName }) });
            void queryClient.refetchQueries({ queryKey: getGetSubscriptionQueryKey({ organizationName }) });
            void navigate({ to: organization_subscription_path({ organization: { name: organizationName } }) });
          }}
        >
          Cancel Scheduled Downgrade
        </Button>

        <Typography variant="body2" color="text.secondary" className={classes.supportText}>
          You can cancel the scheduled downgrade above, or contact support for additional assistance.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.stickyContainer}>
      <Typography variant="h5" className={classes.title}>
        Plan details:
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell className={classes.unitColumn}>Unit</TableCell>
              <TableCell className={classes.includedColumn}>Included</TableCell>
              <TableCell className={classes.overageColumn}>Overage Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Editors</TableCell>
              <TableCell>{formPlanType === 'PERSONAL' ? 1 : formSeats}</TableCell>
              <TableCell>
                <Box className={classes.editorCostBox}>
                  {formPlanType === 'PERSONAL' ? (
                    <Typography variant="body1">Free</Typography>
                  ) : (
                    <>
                      <Typography variant="body1">
                        <UnitNumber
                          value={formCycle === 'YEARLY' ? planCostData.seatPrice / 12 : planCostData.seatPrice}
                          unit="editor/mo"
                          price
                        />
                      </Typography>
                      {formCycle === 'YEARLY' ? (
                        <Typography variant="caption" color="text.secondary" className={classes.billingCaptionLeft}>
                          (billed annually)
                        </Typography>
                      ) : (
                        !isBillingCycleDisabled && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            title="Switch to annual billing"
                            className={classes.savingsHover}
                            onClick={() => {
                              setValue('cycle', 'YEARLY');
                            }}
                          >
                            (save{' '}
                            <UnitNumber
                              nocolor
                              small
                              price
                              unit="year"
                              value={
                                (planCostData.seatPrice * 12 -
                                  (pricePlanMappings[`${formPlanType}_YEARLY`].seatPrice || 0)) *
                                formSeats
                              }
                            />{' '}
                            with annual billing)
                          </Typography>
                        )
                      )}
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Custom Domains</TableCell>
              <TableCell>Unlimited</TableCell>
              <TableCell>
                <Box className={classes.centeredBox}>Included</Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Deploys</TableCell>
              <TableCell>
                <UnitNumber value={planCostData.freeDeployments * 100} unit={formCycle === 'YEARLY' ? 'year' : 'mo'} />
              </TableCell>
              <TableCell>
                <Box className={classes.centeredBox}>Included</Box>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Extra Deployments</TableCell>
              {formDeployOverageEnabled === 'UNLIMITED' ? (
                <TableCell>Unlimited</TableCell>
              ) : formDeployOverageEnabled === 'NO_OVERAGE' ? (
                <TableCell>None</TableCell>
              ) : (
                <TableCell>
                  up to <UnitNumber price value={addonDeploymentPriceInPennies} unit="mo" />
                </TableCell>
              )}
              <TableCell>
                <Box className={classes.centeredBox}>
                  <UnitNumber price value={costPerDeployment * 100} infiniteDecimals unit="deploy" />
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <CouponInput
        canUpdateCoupon={Boolean(subscriptionCouponData?.stripeCouponId)}
        currentCouponData={couponData}
        currentCouponCode={couponCode}
      />

      <Box className={classes.totalSection}>
        <>
          {difference > 0 && (
            <Typography variant="body2" color="success.main" className={classes.savingsText}>
              {`You saved ${formatPenniesToPriceNumber(difference)}`}
            </Typography>
          )}
          <Typography variant="h4" className={classes.totalPrice}>
            {formatPenniesToPriceNumber(total)}

            <Typography component="span" variant="body2" color="text.secondary">
              / {formCycle === 'MONTHLY' ? 'month' : 'year'}
            </Typography>
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            pay now, next payment on {nextBillingDate ?? 'calculation in progress'}
          </Typography> */}
        </>
      </Box>

      <Divider className={classes.divider} />

      <Box className={classes.changeIndicatorSection}>
        <SubscriptionChangeIndicator />
      </Box>

      <CheckoutButton
        canPay={formPlanType === SubscriptionTier.ENTERPRISE || total === 0 || Boolean(formPaymentMethod)}
      />

      <Typography variant="body2" color="text.secondary" className={classes.termsText}>
        By placing this order, you agree to Zephyr Cloud's Terms of Service and Privacy Policy. You may cancel your
        subscriptions at any time from your Organization Settings.
      </Typography>
    </Box>
  );
};
