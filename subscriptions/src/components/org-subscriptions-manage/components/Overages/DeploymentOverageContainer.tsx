import { Box, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { SubscriptionNameMap } from 'app-zephyr-constants';
import { InfoIcon } from 'app-zephyr-icons';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';
import { OverageType, useOverageCalculations } from '../../hooks/useOverageCalculations';
import { DeploymentOverageSelector } from './DeploymentOverageSelector';

export const DeploymentOverageContainer = () => {
  const { control, watch, setValue } = useFormContext<SubscriptionInputs>();
  const { pricePlanMappings, subscription } = useManageSubscription();
  const selectedTier = watch('planType');
  const selectedCycle = watch('cycle');

  // Check if there's a scheduled change that should disable form controls
  const hasScheduledChange = !!subscription.scheduledTier && !!subscription.scheduleReason;

  // Use the shared overage calculations hook
  const currentPlanMapping = pricePlanMappings[`${selectedTier}_${selectedCycle}`];
  const overageCalculations = useOverageCalculations(currentPlanMapping);

  // Handle overage type change
  const handleOverageTypeChange = (value: OverageType) => {
    switch (value) {
      case 'NO_OVERAGE':
        // Reset all overage values to zero
        setValue('overages.deploys.quantityLimit', 0);
        setValue('overages.deploys.dollarLimit', 0);
        setValue('overages.deploys.additional', 0);
        setValue('metrics.deploys', 0);
        break;

      case 'UNLIMITED':
        // Set to infinity for unlimited overages
        setValue('overages.deploys.quantityLimit', 0);
        setValue('overages.deploys.dollarLimit', 0);
        setValue('overages.deploys.additional', Number.POSITIVE_INFINITY);
        setValue('metrics.deploys', null);
        break;

      case 'LIMIT_OVERAGE': {
        // Default to a sensible starting value for limited overages (25% of free deployments)
        const defaultPercentage = 0.1;
        const { deployments, dollarAmount } = overageCalculations.getOverageValuesFromPercentage(defaultPercentage);
        setValue('overages.deploys.quantityLimit', deployments);
        setValue('overages.deploys.dollarLimit', dollarAmount);
        setValue('overages.deploys.additional', deployments);
        setValue('metrics.deploys', defaultPercentage);
        break;
      }
    }
  };

  if (selectedTier === 'PERSONAL') {
    return <PersonalPlanOverageComponent />;
  }

  return (
    <Box sx={{ p: 1, opacity: hasScheduledChange ? 0.6 : 1, pointerEvents: hasScheduledChange ? 'none' : 'auto' }}>
      <Box
        sx={(theme) => ({
          p: 2,
          mb: 3,
          borderRadius: theme.borderRadius.xl,
          border: theme.palette.border.secondary,
        })}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={(theme) => ({ display: 'flex', gap: theme.spacing(1), alignItems: 'center' })}>
            <Typography variant="h6">Deployment Overages</Typography>
            <Tooltip title="These overages don't apply to bring your own cloud.">
              <Box>
                <InfoIcon />
              </Box>
            </Tooltip>
          </Box>

          <Controller
            name={'overages.deploys.overageType'}
            control={control}
            rules={{
              required: 'Please select how to handle deployment overages',
            }}
            render={({ field: { onChange, ...rest } }) => (
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
                <Select
                  sx={{ minWidth: '150px' }}
                  fullWidth
                  {...rest}
                  onChange={(event) => {
                    const value = event.target.value as OverageType;
                    handleOverageTypeChange(value);
                    onChange(event);
                  }}
                >
                  <MenuItem value="NO_OVERAGE">No Overage</MenuItem>
                  <MenuItem value="LIMIT_OVERAGE">Limit Overage</MenuItem>
                  <MenuItem value="UNLIMITED">Unlimited</MenuItem>
                </Select>
              </Box>
            )}
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <DeploymentOverageSelector
            resourceType="deploys"
            label="Deployment Overage Configuration"
            includedAmount={currentPlanMapping.freeDeployments || 0}
          />
        </Box>
      </Box>
    </Box>
  );
};

const PersonalPlanOverageComponent = () => {
  const { setValue } = useFormContext<SubscriptionInputs>();

  React.useEffect(() => {
    setValue('overages.deploys.overageType', 'NO_OVERAGE');
    setValue('overages.deploys.quantityLimit', 0);
    setValue('overages.deploys.dollarLimit', 0);
  }, [setValue]);
  return (
    <div>
      <Typography>Overages are able to be configured on a "{SubscriptionNameMap.PRO}" plan and above.</Typography>
    </div>
  );
};
