import { ArrowDownward, ArrowUpward, Cloud, DragHandle, PeopleAlt } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { tokens } from 'app-zephyr-styles/themes';
import { SubscriptionChangeDirection, SubscriptionChangeType } from '../../hooks/useSubscriptionChangeCalculator';
import { useSubscriptionUpdate } from '../../hooks/useSubscriptionUpdate';

/**
 * A component that displays the direction of the subscription change
 * (upgrade, downgrade, or no change) with appropriate styling and icons.
 */
export function SubscriptionChangeIndicator() {
  const { changeInfo } = useSubscriptionUpdate();
  const { direction, changeType } = changeInfo;

  // No change indicator
  if (direction === SubscriptionChangeDirection.SAME) {
    return (
      <Chip
        icon={<DragHandle />}
        label="No Change"
        variant="outlined"
        sx={{ borderColor: tokens['midnight-400'], color: tokens['midnight-300'] }}
      />
    );
  }

  // Define colors based on direction
  const colors =
    direction === SubscriptionChangeDirection.UPGRADE
      ? { border: tokens['success-500'], text: tokens['success-400'] }
      : { border: tokens['warning-500'], text: tokens['warning-400'] };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={getIcon(direction, changeType)}
        label={getLabel(direction, changeType)}
        variant="outlined"
        sx={{ borderColor: colors.border, color: colors.text }}
      />
      <Typography variant="body2" color="text.secondary">
        {getDescription(direction, changeType)}
      </Typography>
    </Box>
  );
}

// Get the appropriate icon based on change type
const getIcon = (direction: SubscriptionChangeDirection, changeType: SubscriptionChangeType) => {
  // Additional icons based on change type
  switch (changeType) {
    case SubscriptionChangeType.SEATS:
      return <PeopleAlt />;
    case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
      return <Cloud />;
    default:
      return direction === SubscriptionChangeDirection.UPGRADE ? <ArrowUpward /> : <ArrowDownward />;
  }
};

// Get the appropriate label based on change type
const getLabel = (direction: SubscriptionChangeDirection, changeType: SubscriptionChangeType) => {
  const directionLabel = direction === SubscriptionChangeDirection.UPGRADE ? 'Upgrade' : 'Downgrade';

  switch (changeType) {
    case SubscriptionChangeType.PLAN_TIER:
      return `Plan ${directionLabel}`;
    case SubscriptionChangeType.SEATS:
      return `Seats ${directionLabel}`;
    case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
      return `Deployment Overages ${directionLabel}`;
  }

  return directionLabel;
};

// Get the description text based on change type and direction
const getDescription = (direction: SubscriptionChangeDirection, changeType: SubscriptionChangeType) => {
  if (direction === SubscriptionChangeDirection.UPGRADE) {
    switch (changeType) {
      case SubscriptionChangeType.PLAN_TIER:
        return 'Your subscription plan will be upgraded immediately.';
      case SubscriptionChangeType.SEATS:
        return 'Your seat count will be updated immediately.';
      case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
        return 'Your deployment overage settings will be updated immediately.';
      default:
        return 'Your subscription will be upgraded immediately.';
    }
  }

  switch (changeType) {
    case SubscriptionChangeType.PLAN_TIER:
      return 'Your subscription plan will be downgraded at the end of your billing cycle.';
    case SubscriptionChangeType.SEATS:
      return 'Your seat count will be reduced immediately.';
    case SubscriptionChangeType.DEPLOYMENT_OVERAGE:
      return 'Your deployment overage settings will be reduced immediately.';
    default:
      return 'Your subscription will be downgraded at the end of your billing cycle.';
  }
};
