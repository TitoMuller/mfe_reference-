import { useFormContext } from 'react-hook-form';
import { SubscriptionTier } from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../ManageSubscriptionProvider';
import { OverageType } from './useOverageCalculations';

// Subscription tier hierarchy to determine if tier changes are upgrades or downgrades
const TierHierarchy: Record<SubscriptionTier, number> = {
  ENTERPRISE: 30,
  PRO: 20,
  TEAM: 10,
  PERSONAL: 0,
};

export enum SubscriptionChangeDirection {
  UPGRADE = 'UPGRADE',
  DOWNGRADE = 'DOWNGRADE',
  SAME = 'SAME',
}

/**
 * Represents what aspect of the subscription has changed
 *
 * PLAN_TIER: The subscription tier has changed (e.g., PERSONAL to PRO)
 * SEATS: Only the number of seats has changed
 * DEPLOYMENT_OVERAGE: Only the deployment overage settings have changed
 * BILLING_CYCLE_ONLY: Only the billing cycle has changed (not allowed)
 * NONE: No significant changes detected
 */
export enum SubscriptionChangeType {
  PLAN_TIER = 'PLAN_TIER',
  SEATS = 'SEATS',
  DEPLOYMENT_OVERAGE = 'DEPLOYMENT_OVERAGE',
  BILLING_CYCLE_ONLY = 'BILLING_CYCLE_ONLY',
  NONE = 'NONE',
}

/**
 * Custom hook to detect if subscription changes represent an upgrade or downgrade
 *
 * An upgrade can be:
 * 1. Moving from a lower tier to a higher tier (e.g., PERSONAL -> PRO)
 * 2. Staying on PRO but adding more overage capability (e.g., NO_OVERAGE -> LIMIT_OVERAGE or UNLIMITED)
 * 3. Staying on PRO with LIMIT_OVERAGE but increasing the overage limit
 * 4. Increasing the number of seats on any paid plan
 *
 * A downgrade can be:
 * 1. Moving from a higher tier to a lower tier (e.g., PRO -> PERSONAL)
 * 2. Staying on PRO but reducing overage capability (e.g., UNLIMITED -> LIMIT_OVERAGE or NO_OVERAGE)
 * 3. Staying on PRO with LIMIT_OVERAGE but decreasing the overage limit
 * 4. Decreasing the number of seats on any paid plan
 */
export interface SubscriptionChangeInfo {
  /**
   * The direction of the change (upgrade, downgrade, or same)
   */
  direction: SubscriptionChangeDirection;

  /**
   * The type of change (plan tier, seats, deployment overage, or none)
   */
  changeType: SubscriptionChangeType;
}

/**
 * Determines which function to use for submitting subscription changes
 */
export function useSubscriptionChangeCalculator(): SubscriptionChangeInfo {
  const { subscription } = useManageSubscription();
  const { watch } = useFormContext<SubscriptionInputs>();

  // Get current form values
  const selectedTier = watch('planType');
  const selectedCycle = watch('cycle');
  const selectedUsers = watch('metrics.users');
  const deploymentOverageType = watch('overages.deploys.overageType');
  const deploymentOveragePercentage = watch('metrics.deploys');

  // Helper function to determine if values have changed from the subscription
  const valuesSameAsSubscription = (): boolean => {
    const subscriptionSeats = getSubscriptionSeats();
    const hasNoSeatsChange = selectedUsers === subscriptionSeats;
    const hasNoTierChange = selectedTier === subscription.tier;
    const subscriptionOverage = getSubscriptionOverage();

    // If we have a subscription with LIMIT_OVERAGE but form shows NO_OVERAGE,
    // this is likely just the initial form state and not a real change
    const isInitialFormState =
      deploymentOverageType === 'NO_OVERAGE' && subscriptionOverage > 0 && deploymentOveragePercentage === 0;
    return hasNoSeatsChange && hasNoTierChange && isInitialFormState;
  };

  // Helper functions to get subscription values
  const getSubscriptionSeats = (): number => {
    const seatQuota = subscription.quotas.find((q) => q.metric === 'SEATS');
    return seatQuota?.limit ?? 1;
  };

  const getSubscriptionOverage = (): number => {
    const deployQuota = subscription.quotas.find((q) => q.metric === 'DEPLOYMENTS');
    return deployQuota?.overage ?? 0;
  };

  // Analyze the current subscription
  const currentTier = subscription.tier;
  const currentTierLevel = TierHierarchy[currentTier];
  const newTierLevel = TierHierarchy[selectedTier];

  // Find current deployment quota
  const currentDeploymentQuota = subscription.quotas.find((q) => q.metric === 'DEPLOYMENTS');
  const currentOverage = currentDeploymentQuota?.overage;

  // Find current seat quota
  const currentSeatQuota = subscription.quotas.find((q) => q.metric === 'SEATS');
  const currentSeats = currentSeatQuota?.limit ?? 1;

  // Determine current overage type
  let currentOverageType: OverageType = 'NO_OVERAGE';
  if (currentOverage === null || currentOverage === undefined) {
    currentOverageType = 'UNLIMITED';
  } else if (currentOverage > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentOverageType = 'LIMIT_OVERAGE';
  }

  // Create the result object
  const result: SubscriptionChangeInfo = {
    direction: SubscriptionChangeDirection.SAME,
    changeType: SubscriptionChangeType.NONE,
  };

  // Check if tier is changing - this takes precedence over all other changes
  if (newTierLevel !== currentTierLevel) {
    result.changeType = SubscriptionChangeType.PLAN_TIER;
    result.direction =
      newTierLevel > currentTierLevel ? SubscriptionChangeDirection.UPGRADE : SubscriptionChangeDirection.DOWNGRADE;
    return result;
  }

  // At this point, we know that the tier hasn't changed
  // Check if number of seats is changing (only matters for PRO and ENTERPRISE)
  if (currentTier !== 'PERSONAL' && selectedUsers !== currentSeats) {
    result.changeType = SubscriptionChangeType.SEATS;
    result.direction =
      selectedUsers > currentSeats ? SubscriptionChangeDirection.UPGRADE : SubscriptionChangeDirection.DOWNGRADE;
    return result;
  }

  // If we're on the same tier and seats haven't changed, check overages
  if (currentTier !== 'PERSONAL') {
    // Check if overage type has changed
    const hasOverageTypeChanged = deploymentOverageType !== currentOverageType;

    // Check if overage amount has changed (for LIMIT_OVERAGE)
    const hasOverageAmountChanged =
      deploymentOverageType === 'LIMIT_OVERAGE' &&
      currentOverageType === 'LIMIT_OVERAGE' &&
      typeof currentOverage === 'number' &&
      (deploymentOveragePercentage ?? 0) !== currentOverage;

    if (hasOverageTypeChanged || hasOverageAmountChanged) {
      result.changeType = SubscriptionChangeType.DEPLOYMENT_OVERAGE;

      // Determine direction for overage type changes
      if (hasOverageTypeChanged) {
        if (
          (currentOverageType === 'NO_OVERAGE' && deploymentOverageType !== 'NO_OVERAGE') ||
          (currentOverageType === 'LIMIT_OVERAGE' && deploymentOverageType === 'UNLIMITED')
        ) {
          result.direction = SubscriptionChangeDirection.UPGRADE;
        } else {
          result.direction = SubscriptionChangeDirection.DOWNGRADE;
        }
      }
      // Determine direction for overage amount changes
      else if (hasOverageAmountChanged && typeof currentOverage === 'number') {
        result.direction =
          (deploymentOveragePercentage || 0) > currentOverage
            ? SubscriptionChangeDirection.UPGRADE
            : SubscriptionChangeDirection.DOWNGRADE;
      }

      return result;
    }
  }

  // Check if only billing cycle has changed (not allowed)
  const hasBillingCycleChanged = selectedCycle !== subscription.cycle;
  const hasNoOtherChanges =
    selectedTier === subscription.tier &&
    selectedUsers === currentSeats &&
    deploymentOverageType === currentOverageType;

  if (hasBillingCycleChanged && hasNoOtherChanges) {
    result.changeType = SubscriptionChangeType.BILLING_CYCLE_ONLY;
    result.direction = SubscriptionChangeDirection.SAME;
    return result;
  }

  // Before returning "NONE", check if this is just the initial form state
  if (valuesSameAsSubscription()) {
    result.direction = SubscriptionChangeDirection.SAME;
    result.changeType = SubscriptionChangeType.NONE;
    return result;
  }
  return result;
}
