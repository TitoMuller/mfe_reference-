import { DevTool } from '@hookform/devtools';
import { Add, CheckCircleOutline, Edit, ErrorOutline } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid2 as Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import * as Sentry from '@sentry/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'app-zephyr-components/Button';
import { SubscriptionNameMap } from 'app-zephyr-constants';
import { organization_subscription_path, useTypedParams } from 'app-zephyr-routes';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useFormContext } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import { BillingCycle, getGetSubscriptionQueryKey, getListPaymentMethodsQueryKey, SubscriptionTier } from 'ze-sdk';
import { AddPaymentMethodModal, AddPaymentMethodModalContent } from '../../add-payment-method-modal';
import { useModal } from '../hooks/useModal';
import { PricePlanMappings } from '../hooks/useOverageCalculations';
import { useSubscriptionUpdate } from '../hooks/useSubscriptionUpdate';
import { type SubscriptionInputs, useManageSubscription } from '../ManageSubscriptionProvider';
import { formatPenniesToPriceNumber } from '../money-functions/money';
import { BillingCycleSelector } from './BillingCycleSelector';
import { CheckoutComponent } from './checkout/Checkout';
import { DeploymentOverageContainer } from './Overages';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PlanSelector } from './PlanSelector';
import { useZeContentStyles } from './styles';
import { UnitNumber } from './ui/UnitNumber';

interface Step {
  id: string;
  errorMessage?: string;
  title: React.ReactNode;
  component: React.ReactNode;
  summary?: React.ReactNode;
  hide?: () => boolean;
  validateFn: () => Promise<void>;
  shouldShowGreenCheck: () => boolean;
}

/**
 * Calculate and format the savings message based on billing cycle and plan details
 */
function getSavingsMessage(
  selectedCycle: BillingCycle,
  selectedTier: SubscriptionTier,
  selectedUsers: number,
  pricePlanMappings: PricePlanMappings,
): string {
  if (selectedTier === 'PERSONAL') {
    return selectedCycle === 'MONTHLY' ? 'Billed monthly' : 'Billed annually';
  }

  const monthlyPrice = pricePlanMappings[`${selectedTier}_MONTHLY`].seatPrice * selectedUsers || 0;
  const yearlyPrice = pricePlanMappings[`${selectedTier}_YEARLY`].seatPrice * selectedUsers || 0;

  switch (selectedCycle) {
    case 'YEARLY': {
      const savingsAmount = monthlyPrice * 12 - yearlyPrice;

      if (savingsAmount > 0) {
        return `You're saving ${formatPenniesToPriceNumber(savingsAmount)} yearly!`;
      }

      return 'Billed annually';
    }

    case 'MONTHLY': {
      const savingsPercentage =
        monthlyPrice > 0 ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100) : 0;

      if (savingsPercentage > 0) {
        return `Save ${savingsPercentage.toString()}% with annual billing`;
      }

      return 'Billed monthly';
    }

    // unreachable, but just in case
    default:
      return 'Billed monthly';
  }
}

function ZeContent() {
  const { classes } = useZeContentStyles();
  const queryClient = useQueryClient();
  const { paymentMethods, organizationName, pricePlanMappings, subscription } = useManageSubscription();
  const { handleSubmit: handleSubscriptionSubmit } = useSubscriptionUpdate();

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<SubscriptionInputs>();
  const navigate = useNavigate();
  const { organization } = useTypedParams();
  if (!organization) {
    throw new Error('Organization not found');
  }
  const selectedTier = watch('planType');
  const selectedCycle = watch('cycle');
  const selectedUsers = watch('metrics.users');
  const selectedCouponCode = watch('coupon.code');
  const selectedPaymentMethodId = watch('paymentMethod');
  const cycleText = selectedCycle === 'MONTHLY' ? 'month' : 'year';

  const deploymentOverageMoney = watch('overages.deploys.dollarLimit');
  const deploymentOverageCount = watch('overages.deploys.quantityLimit');
  const deploymentOverageType = watch('overages.deploys.overageType');

  // Check if there's a scheduled change that should disable form controls
  const hasScheduledChange = !!subscription.scheduledTier && !!subscription.scheduleReason;

  const [visitedSections, setVisitedSections] = useState<number[]>([0]);
  const { isOpen: isModalOpen, handleOpen: handleOpenModal, handleClose: handleCloseModal } = useModal();
  const [expanded, setExpanded] = useState<number | undefined>(0);

  // Every time the selected tier changes, reset the visited sections
  useEffect(() => {
    setVisitedSections([0]);
  }, [selectedTier]);

  // If the cycle is not monthly, ensure the billing cycle section is visited
  useEffect(() => {
    if (selectedCycle !== 'MONTHLY' && !visitedSections.includes(1)) {
      setVisitedSections((pvs) => [...pvs, 1]);
    }
  }, [visitedSections, selectedCycle]);

  // Use the enhanced submission handler that automatically
  // determines which API to call based on change type
  const onSubmit: SubmitHandler<SubscriptionInputs> = async () => {
    try {
      await handleSubscriptionSubmit();
      toast.success('Subscription updated successfully!');
    } catch (error: any) {
      let errorMessage = 'Failed to update subscription. Please try again.';
      let captureException = true;

      if (error.response) {
        captureException = error.response.status >= 500;
        errorMessage = error.response.data.errorMessage || `Failed to update subscription, please try again.`;
      } else if (error.request) {
        // Request was made but no response was received
        errorMessage = 'Network error: Please check your internet connection and try again.';
        captureException = false;
      }

      toast.error(errorMessage);

      if (captureException) {
        Sentry.captureException(error, {
          extra: {
            organizationName,
            selectedTier,
            selectedCycle,
            selectedUsers,
            selectedCouponCode,
            deploymentOverageType,
            deploymentOverageMoney,
            deploymentOverageCount,
            selectedPaymentMethodId,
          },
        });
      }
    }

    await queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey({ organizationName }) });
    await queryClient.refetchQueries({ queryKey: getGetSubscriptionQueryKey({ organizationName }) });
  };

  const handleChange = (step: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? step : undefined);
    setVisitedSections((prevVisitedSections) => Array.from(new Set([...prevVisitedSections, step])));
    // Only validate the form, but don't mark it as dirty
    if (isExpanded) {
      Steps[step].validateFn().catch((e: unknown) => {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        throw new Error('An error occurred');
      });
    }
  };
  const deploymentOverageErrors =
    errors.overages?.deploys?.overageType?.message ??
    errors.overages?.deploys?.message ??
    errors.overages?.deploys?.dollarLimit?.message ??
    errors.overages?.deploys?.quantityLimit?.message;

  const totalPrice = pricePlanMappings[`${selectedTier}_${selectedCycle}`].seatPrice * selectedUsers || 0;
  const selectedPaymentMethod = paymentMethods?.find((pm) => pm.id === selectedPaymentMethodId);

  const Steps: Step[] = useMemo(
    () => [
      {
        id: 'plan-type',
        errorMessage: errors.planType?.message,
        title: <Typography variant="h6">Choose Your Plan</Typography>,
        component: <PlanSelector />,
        validateFn: async () => {
          await trigger('planType');
        },
        shouldShowGreenCheck: () => {
          return visitedSections.includes(0) && !errors.planType && !!selectedTier;
        },
        summary: (
          <Box className={classes.summaryColumn}>
            <Typography variant="body1">{SubscriptionNameMap[selectedTier]}</Typography>
            <Box className={classes.summaryRowWithIcon}>
              <Typography variant="body2" color="text.secondary">
                {totalPrice === 0 ? 'Free' : <UnitNumber price value={totalPrice} unit={cycleText} />}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {selectedTier === 'PERSONAL' ? 1 : selectedUsers} editor seat
              {selectedUsers <= 1 ? '' : 's'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pricePlanMappings[`${selectedTier}_${selectedCycle}`].freeDeployments.toLocaleString()} deployments
            </Typography>
          </Box>
        ),
      },
      {
        id: 'billing-cycle',
        errorMessage: errors.cycle?.message,
        title: <Typography variant="h6">Billing Cycle</Typography>,
        component: <BillingCycleSelector />,
        validateFn: async () => {
          await trigger('cycle');
        },
        // personal does not allow yearly subscriptions
        hide: () => {
          return selectedTier === 'PERSONAL';
        },
        shouldShowGreenCheck: () => {
          return visitedSections.includes(1) && !errors.cycle && !!selectedCycle;
        },
        summary: (
          <Box className={classes.summaryColumn}>
            <Typography variant="body1">{selectedCycle === 'MONTHLY' ? 'Monthly' : 'Annual'} Billing</Typography>
            <Typography
              variant="body2"
              className={
                selectedCycle === 'YEARLY' && selectedTier !== 'PERSONAL'
                  ? classes.savingsTextSuccess
                  : selectedCycle === 'MONTHLY' && selectedTier !== 'PERSONAL'
                    ? classes.savingsTextSuccess
                    : classes.savingsTextSecondary
              }
            >
              {getSavingsMessage(selectedCycle, selectedTier, selectedUsers, pricePlanMappings)}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'configure-overages',
        errorMessage: deploymentOverageErrors,
        title: <Typography variant="h6">Configure Add-ons</Typography>,
        validateFn: async () => {
          await trigger('overages.deploys.overageType');
          await trigger('overages.deploys.dollarLimit');
          await trigger('overages.deploys.quantityLimit');
        },
        shouldShowGreenCheck: () => {
          return visitedSections.includes(2) && !deploymentOverageErrors && !!deploymentOverageType;
        },
        hide: () => {
          return selectedTier === 'PERSONAL';
        },
        summary: (
          <Box className={classes.summaryColumnWithGap}>
            <Typography variant="body1">
              {deploymentOverageType === 'NO_OVERAGE'
                ? 'No overages allowed'
                : deploymentOverageType === 'UNLIMITED'
                  ? 'Unlimited deployments'
                  : `Overages configured`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {deploymentOverageType === 'NO_OVERAGE'
                ? "You won't be charged"
                : deploymentOverageType === 'UNLIMITED'
                  ? 'We will never stop you from deploying'
                  : `Limit overage to $${(deploymentOverageMoney ?? 0).toFixed(2)} or ${(deploymentOverageCount ?? 0).toFixed(0)} deployments`}
            </Typography>
          </Box>
        ),
        component: <DeploymentOverageContainer />,
      },
      {
        id: 'payment-method',
        errorMessage: errors.paymentMethod?.message ?? '',
        validateFn: async () => {
          await trigger('paymentMethod');
        },
        shouldShowGreenCheck: () => {
          return visitedSections.includes(3) && !errors.paymentMethod && !!selectedPaymentMethodId;
        },
        title: (
          <Box>
            <Typography variant="h6">Billing Information</Typography>
            <Typography color="error" variant="body2">
              {errors.paymentMethod?.message ?? ''}
            </Typography>
          </Box>
        ),
        summary: selectedPaymentMethod ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">
              Using {selectedPaymentMethod.card?.brand.toUpperCase()} ending in {selectedPaymentMethod.card?.last4}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can change this at any time
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary">
              Please add a payment method
            </Typography>
          </Box>
        ),
        component: (
          <Box sx={{ opacity: hasScheduledChange ? 0.6 : 1, pointerEvents: hasScheduledChange ? 'none' : 'auto' }}>
            {paymentMethods && paymentMethods.length > 0 && <PaymentMethodSelector paymentMethods={paymentMethods} />}
            <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Button
                color="secondary"
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenModal}
                disabled={hasScheduledChange}
              >
                Add Payment Method
              </Button>
            </Box>
          </Box>
        ),
      },
    ],
    [
      classes.savingsTextSecondary,
      classes.savingsTextSuccess,
      classes.summaryColumn,
      classes.summaryColumnWithGap,
      classes.summaryRowWithIcon,
      errors.planType,
      errors.cycle,
      errors.paymentMethod,
      selectedTier,
      pricePlanMappings,
      selectedCycle,
      selectedUsers,
      cycleText,
      deploymentOverageErrors,
      deploymentOverageType,
      deploymentOverageMoney,
      deploymentOverageCount,
      paymentMethods,
      handleOpenModal,
      trigger,
      selectedPaymentMethod,
      visitedSections,
      selectedPaymentMethodId,
      hasScheduledChange,
      totalPrice,
    ],
  );

  return (
    <Box>
      <Toaster />
      <form
        onSubmit={(e) => {
          void handleSubmit(async (data) => {
            try {
              await onSubmit(data);
              void navigate({ to: organization_subscription_path({ organization: { name: organization } }) });
            } catch {
              toast.error('Failed to update subscription. Please try again.');
            }
          })(e);
        }}
      >
        <Grid container direction="row" spacing={3}>
          <Grid className={classes.mainContainer} size={{ xs: 12, md: 6 }}>
            {Steps.map(({ id, component, summary, title, errorMessage, hide }, index) => {
              // Cannot be inside a filter to preserve index position
              if (hide?.()) {
                return null;
              }

              return (
                <Accordion
                  component={Box}
                  key={id}
                  disabled={hasScheduledChange}
                  className={clsx(classes.accordion, hasScheduledChange && classes.accordionDisabled)}
                  expanded={expanded === index}
                  onChange={hasScheduledChange ? undefined : handleChange(index)}
                >
                  <AccordionSummary className={classes.accordionSummary} expandIcon={<ExpandChangeIcon />}>
                    <Box className={classes.accordionSummaryContent}>
                      <Box className={classes.summaryTitleRow}>
                        <Box className={classes.summaryTitleWithIcon}>
                          {errorMessage ? (
                            <ErrorOutline color="error" />
                          ) : Steps[index].shouldShowGreenCheck() ? (
                            <CheckCircleOutline color="success" />
                          ) : null}
                          {title}
                        </Box>

                        <Box className={classes.summaryContentRow}>{summary}</Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {component}

                    {Steps[index + 1] && (
                      <Stack direction="row" className={classes.continueSection}>
                        <Button
                          onClick={() => {
                            // Move to next section without marking the form as dirty
                            setExpanded(index + 1);
                            setVisitedSections((prevVisitedSections) =>
                              Array.from(new Set([...prevVisitedSections, index + 1])),
                            );
                          }}
                        >
                          Continue
                        </Button>
                        {id === 'configure-overages' && (
                          <Typography>
                            Need a custom quote? <Link href="mailto:zephyr@zephyr-cloud.io">Contact us</Link>
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Grid>
          <Grid className={classes.checkoutGrid} size={{ xs: 12, md: 6 }}>
            <CheckoutComponent />
          </Grid>
        </Grid>
      </form>
      <DevTool control={control} />
      <AddPaymentMethodModal open={isModalOpen} onClose={handleCloseModal}>
        <AddPaymentMethodModalContent
          defaultLocked={false}
          handleClose={(params) => {
            void queryClient.refetchQueries({
              queryKey: getListPaymentMethodsQueryKey({ organizationName }),
            });
            if (params?.paymentMethodId) {
              setValue('paymentMethod', params.paymentMethodId, {
                shouldDirty: false,
                shouldValidate: true,
                shouldTouch: false,
              });
            }
            handleCloseModal();
          }}
        />
      </AddPaymentMethodModal>
    </Box>
  );
}

export { ZeContent };

const ExpandChangeIcon = () => {
  const { classes } = useZeContentStyles();
  return (
    <Box className={classes.expandIcon}>
      <Edit />
    </Box>
  );
};
