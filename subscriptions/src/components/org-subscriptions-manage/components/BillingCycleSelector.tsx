import { Box, RadioGroup, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { BillingCycle } from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../ManageSubscriptionProvider';
import { CycleCard } from './checkout/CycleCard';

const getBillingCycleMessage = (hasScheduledChange: boolean, isCycleForced: boolean): string => {
  if (hasScheduledChange) {
    return 'Billing cycle cannot be changed while a downgrade is scheduled';
  }
  if (isCycleForced) {
    return 'Billing cycle is locked by the applied coupon';
  }
  return 'Billing cycle can only be changed when upgrading or downgrading plans';
};

export const BillingCycleSelector = () => {
  const { watch } = useFormContext<SubscriptionInputs>();
  const { pricePlanMappings, subscription } = useManageSubscription();
  const selectedCycle = watch('cycle');
  const selectedPlan = watch('planType');
  const selectedUsers = watch('metrics.users');
  const couponData = watch('coupon.data');

  // Disable billing cycle selection if the plan is the same as current subscription or there's a scheduled change
  const hasScheduledChange = !!subscription.scheduledTier && !!subscription.scheduleReason;
  const isCycleForced = !!couponData?.forcedCycle;
  const isDisabled = selectedPlan === subscription.tier || hasScheduledChange || isCycleForced;

  // Calculate prices for current plan and user count
  const calculatePriceForCycle = useCallback(
    (cycle: BillingCycle) => {
      if (selectedPlan === 'PERSONAL') return 0;

      const planMapping = pricePlanMappings[`${selectedPlan}_${cycle}`];

      return planMapping.seatPrice * selectedUsers;
    },
    [selectedPlan, selectedUsers, pricePlanMappings],
  );

  // Calculate per-seat price for display
  const calculatePerSeatPriceForCycle = useCallback(
    (cycle: BillingCycle) => {
      if (selectedPlan === 'PERSONAL') return 0;

      const planMapping = pricePlanMappings[`${selectedPlan}_${cycle}`];

      return planMapping.seatPrice;
    },
    [selectedPlan, pricePlanMappings],
  );

  const { monthlyPrice, yearlyMonthlyEquivalent, annualSavings, savingsPercentage, monthlyPerSeat, yearlyPerSeat } =
    useMemo(() => {
      const monthly = calculatePriceForCycle('MONTHLY');
      const yearly = calculatePriceForCycle('YEARLY');
      const monthlyPerSeatPrice = calculatePerSeatPriceForCycle('MONTHLY');
      const yearlyPerSeatPrice = calculatePerSeatPriceForCycle('YEARLY');
      const monthlyEquivalent = yearlyPerSeatPrice / 12;
      const savings = monthly * 12 - yearly;
      const percentage = monthly > 0 ? Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100) : 0;

      return {
        monthlyPrice: monthly,
        yearlyPrice: yearly,
        yearlyMonthlyEquivalent: monthlyEquivalent,
        annualSavings: savings,
        savingsPercentage: percentage,
        monthlyPerSeat: monthlyPerSeatPrice,
        yearlyPerSeat: yearlyPerSeatPrice,
      };
    }, [calculatePriceForCycle, calculatePerSeatPriceForCycle]);

  return (
    <Box sx={{ width: '100%', opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      {isDisabled && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          {getBillingCycleMessage(hasScheduledChange, isCycleForced)}
        </Typography>
      )}
      <Controller
        name="cycle"
        render={({ field }) => (
          <RadioGroup {...field}>
            <Stack spacing={2}>
              <CycleCard
                cycle="MONTHLY"
                title="Monthly Billing"
                monthlyPrice={monthlyPrice}
                isSelected={selectedCycle === 'MONTHLY'}
                isDisabled={isDisabled}
                perSeatPrice={monthlyPerSeat}
              />

              <CycleCard
                cycle="YEARLY"
                title="Annual Billing"
                isSelected={selectedCycle === 'YEARLY'}
                isDisabled={isDisabled}
                perSeatPrice={yearlyPerSeat}
                monthlyPrice={monthlyPrice}
                monthlyEquivalent={yearlyMonthlyEquivalent}
                annualSavings={annualSavings}
                savingsPercentage={savingsPercentage}
                showSavingsChip={true}
                showSavingsText={true}
              />
            </Stack>
          </RadioGroup>
        )}
      />
    </Box>
  );
};
