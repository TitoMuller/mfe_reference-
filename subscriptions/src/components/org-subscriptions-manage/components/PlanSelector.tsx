import { Box, Collapse, Link, RadioGroup, Typography } from '@mui/material';
import { SubscriptionNameMap } from 'app-zephyr-constants';
import { Controller, useFormContext } from 'react-hook-form';
import { SubscriptionInputs, useManageSubscription } from '../ManageSubscriptionProvider';
import { PlanCard } from './checkout/PlanCard';

export const PlanSelector = () => {
  const { watch } = useFormContext<SubscriptionInputs>();
  const { subscription } = useManageSubscription();

  // Check if there's a scheduled change that should disable form controls
  const hasScheduledChange = !!subscription.scheduledTier && !!subscription.scheduleReason;

  const selectedPlan = watch('planType');
  const forcedTier = watch('coupon.data.forcedTier');
  const forcedCycle = watch('coupon.data.forcedCycle');

  return (
    <Box
      sx={{ width: '100%', opacity: hasScheduledChange ? 0.6 : 1, pointerEvents: hasScheduledChange ? 'none' : 'auto' }}
    >
      {forcedCycle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          Billing cycle is locked by the applied coupon
        </Typography>
      )}
      <Controller
        name="planType"
        render={({ field }) => (
          <RadioGroup {...field}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <PlanCard tier="PERSONAL" />
              <PlanCard tier="TEAM" />
              <PlanCard tier="PRO" />
              <Collapse in={forcedTier === 'ENTERPRISE' || selectedPlan === 'ENTERPRISE'} timeout={300}>
                <PlanCard tier="ENTERPRISE" />
              </Collapse>
            </Box>
          </RadioGroup>
        )}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
        <Link href="mailto:inbound@zephyr-cloud.io">Contact sales</Link> for more information about the{' '}
        {SubscriptionNameMap.ENTERPRISE} plan.
      </Typography>
    </Box>
  );
};
