import { CircularProgress } from '@mui/material';
import { Button } from 'app-zephyr-components/Button';
import { useFormContext } from 'react-hook-form';
import { SubscriptionInputs } from '../../ManageSubscriptionProvider';
import {
  SubscriptionChangeDirection,
  SubscriptionChangeInfo,
  SubscriptionChangeType,
} from '../../hooks/useSubscriptionChangeCalculator';
import { useSubscriptionUpdate } from '../../hooks/useSubscriptionUpdate';

export const CheckoutButton = (props: { canPay: boolean }) => {
  const {
    formState: { isSubmitting, errors },
  } = useFormContext<SubscriptionInputs>();
  const { changeInfo } = useSubscriptionUpdate();
  const isDisabled =
    !props.canPay ||
    changeInfo.direction === SubscriptionChangeDirection.SAME ||
    isSubmitting ||
    changeInfo.changeType === SubscriptionChangeType.NONE ||
    changeInfo.changeType === SubscriptionChangeType.BILLING_CYCLE_ONLY ||
    !!Object.keys(errors).length;

  return (
    <Button type="submit" disabled={isDisabled} fullWidth color={getButtonColor(changeInfo)}>
      {getButtonText(changeInfo, isSubmitting, props.canPay)}
    </Button>
  );
};

const getButtonColor = (changeInfo: SubscriptionChangeInfo) => {
  if (changeInfo.changeType === SubscriptionChangeType.PLAN_TIER) {
    return changeInfo.direction === SubscriptionChangeDirection.UPGRADE ? 'success' : 'warning';
  }

  return 'primary';
};

// Customize button text and color based on change type and direction
const getButtonText = (changeInfo: SubscriptionChangeInfo, isSubmitting: boolean, canPay: boolean) => {
  if (isSubmitting) {
    return <CircularProgress size={24} />;
  }

  if (!canPay) {
    return 'Select payment method';
  }

  switch (changeInfo.changeType) {
    case SubscriptionChangeType.PLAN_TIER:
      return changeInfo.direction === SubscriptionChangeDirection.UPGRADE ? 'Upgrade Plan' : 'Downgrade Plan';
    case SubscriptionChangeType.SEATS:
      return 'Update Seats';
    case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
      return 'Update Deployment Overages';
    case SubscriptionChangeType.BILLING_CYCLE_ONLY:
      return 'Cancel subscription first';
  }

  return 'No Changes';
};
