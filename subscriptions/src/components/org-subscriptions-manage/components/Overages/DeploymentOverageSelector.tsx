import { SwapHoriz } from '@mui/icons-material';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import { SubscriptionCycleMap } from 'app-zephyr-constants';
import { Controller, type ControllerRenderProps, useFormContext } from 'react-hook-form';
import { useOverageCalculations } from '../../hooks/useOverageCalculations';
import { type SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';
import { MaxOverageLimit } from '../constants';

export function DeploymentOverageSelector({
  resourceType,
  includedAmount,
}: {
  resourceType: 'deploys' | 'bandwidth';
  label: string;
  includedAmount: number;
}) {
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<SubscriptionInputs>();
  const { pricePlanMappings } = useManageSubscription();
  const extraDeployments = watch('overages.deploys.additional');
  const overageType = watch(`overages.${resourceType}.overageType`);
  const selectedPlan = watch('planType');
  const selectedCycle = watch('cycle');
  const price = pricePlanMappings[`${selectedPlan}_${selectedCycle}`];

  // Use the shared hook for overage calculations
  const { calculateDeploymentsFromDollarAmount, calculateDollarAmountFromDeployments, calculateOveragePercentage } =
    useOverageCalculations(price);

  const handleChange = ({
    field,
    event,
  }: {
    field: ControllerRenderProps<SubscriptionInputs>;
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  }) => {
    const numericValue = Math.min(MaxOverageLimit, parseFloat(event.target.value));
    let deployments = 0;
    let percent = 0.0;

    if (isNaN(numericValue)) {
      return;
    }

    if (field.name === `overages.${resourceType}.dollarLimit`) {
      // Calculate deployments from dollar amount
      deployments = calculateDeploymentsFromDollarAmount(numericValue);
      setValue('overages.deploys.additional', deployments);
      percent = calculateOveragePercentage(deployments);
      setValue(`overages.${resourceType}.quantityLimit`, deployments);
      setValue(`overages.${resourceType}.dollarLimit`, numericValue);
      void trigger(`overages.${resourceType}.dollarLimit`);
      void trigger(`overages.${resourceType}.quantityLimit`);
    } else if (field.name === `overages.${resourceType}.quantityLimit`) {
      // Calculate dollar amount from deployments
      deployments = numericValue;
      setValue('overages.deploys.additional', numericValue);
      const deploymentsCostInDollars = calculateDollarAmountFromDeployments(deployments);
      percent = calculateOveragePercentage(deployments);
      setValue(`overages.${resourceType}.quantityLimit`, numericValue);
      setValue(`overages.${resourceType}.dollarLimit`, deploymentsCostInDollars);
    }

    // Store percentage in metrics
    setValue(`metrics.${resourceType}`, percent);
  };

  return (
    <Box sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', mb: 1, flexDirection: 'column' }}>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            Comes with {includedAmount.toLocaleString()} {resourceType === 'bandwidth' ? 'GB' : resourceType} per{' '}
            {SubscriptionCycleMap[selectedCycle].toLowerCase()} cycle
          </Typography>

          <Box
            sx={{
              opacity: (overageType === 'LIMIT_OVERAGE' && extraDeployments > 0) || overageType === 'UNLIMITED' ? 1 : 0,
              height: overageType !== 'NO_OVERAGE' ? '20px' : '0px',
              overflow: 'hidden',
              transition: 'opacity 0.3s ease-in-out, height 0.3s ease-in-out',
            }}
          >
            <Box>
              {overageType === 'LIMIT_OVERAGE' ? (
                <Typography variant="body2" color="text.secondary">
                  You're adding deployment overage up to <strong>{extraDeployments.toLocaleString()}</strong> extra{' '}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You're adding unlimited deployment overage
                </Typography>
              )}
              {resourceType}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box>
        <Tooltip
          title={
            overageType === 'UNLIMITED'
              ? "You've selected 'Unlimited' overages, to configure these values pick  `Limit Overage' from the dropdown"
              : ''
          }
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              opacity: overageType !== 'NO_OVERAGE' ? 1 : 0.0,
              height: overageType !== 'NO_OVERAGE' ? '55px' : '0px',
              transition: 'opacity 0.4s ease-in-out, height 0.3s ease-in-out',
            }}
          >
            <Controller
              name={`overages.${resourceType}.dollarLimit`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.overages?.deploys?.dollarLimit?.message}
                  helperText={errors.overages?.deploys?.dollarLimit?.message}
                  onChange={(change) => {
                    handleChange({ field, event: change });
                  }}
                  size="small"
                  disabled={overageType !== 'LIMIT_OVERAGE'}
                  slotProps={{
                    input: {
                      inputProps: { min: 0, max: MaxOverageLimit, step: 0.01 },
                      startAdornment: '$',
                    },
                  }}
                  sx={{ width: '150px' }}
                />
              )}
            />
            <Box sx={{ mt: 1 }}>
              <SwapHoriz />
            </Box>

            <Controller
              name={`overages.${resourceType}.quantityLimit`}
              control={control}
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  return value % 1000 === 0 || 'Increments of 1000 only';
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.overages?.deploys?.quantityLimit?.message}
                  helperText={errors.overages?.deploys?.quantityLimit?.message}
                  disabled={overageType !== 'LIMIT_OVERAGE'}
                  onChange={(change) => {
                    handleChange({ field, event: change });
                  }}
                  type="number"
                  size="small"
                  slotProps={{
                    input: {
                      inputProps: { min: 0, max: MaxOverageLimit, step: 10 },
                    },
                  }}
                  placeholder="0"
                  sx={{ width: '150px' }}
                />
              )}
            />
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
