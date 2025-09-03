import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import {
  ChangeSubscriptionPathParameters,
  ChangeSubscriptionRequest,
  useChangeSubscription,
  useUpdateNonRecurringQuota,
  useUpdateRecurringQuota,
} from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../ManageSubscriptionProvider';
import {
  SubscriptionChangeDirection,
  SubscriptionChangeType,
  useSubscriptionChangeCalculator,
} from './useSubscriptionChangeCalculator';

/**
 * This hook determines the appropriate update method to use based on
 * the type of subscription change detected.
 */
export function useSubscriptionUpdate() {
  const { organizationName } = useManageSubscription();
  const { mutateAsync: handleChangeSubscription } = useChangeSubscription();
  const { getValues } = useFormContext<SubscriptionInputs>();
  const changeInfo = useSubscriptionChangeCalculator();

  // Get mutation hooks for specific quota updates
  const { mutateAsync: updateNonRecurringQuota } = useUpdateNonRecurringQuota({
    mutation: {
      throwOnError: true,
    },
  });

  const { mutateAsync: updateRecurringQuota } = useUpdateRecurringQuota({
    mutation: {
      throwOnError: true,
    },
  });

  /**
   * Based on the change type, returns the appropriate update function to use
   */
  const getUpdateFunction = (): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFn: UseMutateAsyncFunction<any, unknown, any>;
    changeType: SubscriptionChangeType;
  } => {
    switch (changeInfo.changeType) {
      case SubscriptionChangeType.PLAN_TIER:
        // For plan tier changes, use handleChangeSubscription
        return {
          updateFn: handleChangeSubscription,
          changeType: SubscriptionChangeType.PLAN_TIER,
        };

      case SubscriptionChangeType.SEATS:
        // For seat changes, use updateNonRecurringQuota
        return {
          updateFn: updateNonRecurringQuota,
          changeType: SubscriptionChangeType.SEATS,
        };

      case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
        // For deployment overage changes, use updateRecurringQuota

        return {
          updateFn: updateRecurringQuota,
          changeType: SubscriptionChangeType.DEPLOYMENT_OVERAGE,
        };

      case SubscriptionChangeType.NONE:
      default:
        // Default to plan tier change if no specific change is detected
        return {
          updateFn: handleChangeSubscription,
          changeType: SubscriptionChangeType.PLAN_TIER,
        };
    }
  };

  /**
   * Handles the form submission based on the detected change type
   */
  const handleSubmit = async () => {
    const { updateFn, changeType } = getUpdateFunction();
    const newTier = getValues('planType');
    const newSeats = getValues('metrics.users');
    const couponCode = getValues('coupon.code');
    const newPaymentMethod = getValues('paymentMethod');
    const deploys = getValues('metrics.deploys');
    const newBillingCycle = getValues('cycle');

    // Prepare the arguments based on the change type
    let args: unknown;
    switch (changeType) {
      case SubscriptionChangeType.PLAN_TIER:
        {
          // Handle full subscription change
          const isDowngradeToFree =
            changeInfo.direction === SubscriptionChangeDirection.DOWNGRADE && newTier === 'PERSONAL';

          // Create the request payload differently based on whether it's a downgrade to free
          let requestData: ChangeSubscriptionRequest;

          if (isDowngradeToFree) {
            // For downgrades to free plan, don't include payment or overages
            // PERSONAL tier is always monthly
            // Only include mandatory fields for free plans - omit optional ones
            requestData = {
              newTier: 'PERSONAL',
              newBillingCycle: 'MONTHLY',
            };
          } else {
            // For other plan changes, include all fields
            requestData = {
              newTier: newTier,
              newBillingCycle: newBillingCycle,
              coupon: couponCode,
              stripePaymentMethodId: newPaymentMethod,
              amounts: {
                SEATS: newSeats,
              },
              overages: {
                DEPLOYMENTS: deploys,
              },
            };
          }

          args = {
            pathParams: { organizationName } as ChangeSubscriptionPathParameters,
            data: requestData,
          };
        }
        break;

      case SubscriptionChangeType.SEATS:
        // Handle seats update
        args = {
          pathParams: { organizationName, metric: 'SEATS' },
          data: {
            limit: newSeats,
            stripePaymentMethodId: newPaymentMethod,
            coupon: couponCode,
          },
        };
        break;

      case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
        // Handle deployment overage update
        args = {
          pathParams: { organizationName, metric: 'DEPLOYMENTS' },
          data: {
            overage: deploys,
          },
        };
        break;

      default:
        throw new Error('Invalid change type detected');
    }

    await updateFn(args);
  };

  return {
    changeInfo,
    handleSubmit,
  };
}
