import { Box, Chip, FormControlLabel, Radio, Typography } from '@mui/material';
import { clsx } from 'clsx';
import { useFormContext } from 'react-hook-form';
import { BillingCycle } from 'ze-sdk';
import { SubscriptionInputs, useManageSubscription } from '../../ManageSubscriptionProvider';
import { UnitNumber } from '../ui/UnitNumber';
import { useCycleCardStyles } from './styles';

interface CycleCardProps {
  cycle: BillingCycle;
  title: string;
  isSelected: boolean;
  isDisabled: boolean;
  perSeatPrice: number;
  monthlyPrice: number;
  monthlyEquivalent?: number;
  annualSavings?: number;
  savingsPercentage?: number;
  showSavingsChip?: boolean;
  showSavingsText?: boolean;
}

export const CycleCard = ({
  cycle,
  title,
  isSelected,
  isDisabled,
  perSeatPrice,
  monthlyPrice,
  monthlyEquivalent,
  annualSavings,
  savingsPercentage,
  showSavingsChip = false,
  showSavingsText = false,
}: CycleCardProps) => {
  const { classes } = useCycleCardStyles();
  const { watch } = useFormContext<SubscriptionInputs>();
  const { subscription } = useManageSubscription();

  const selectedPlan = watch('planType');
  const selectedCycle = watch('cycle');

  const isCurrentlyActive = selectedPlan === subscription.tier && subscription.cycle === cycle;

  return (
    <FormControlLabel
      className={clsx(
        classes.formControlLabel,
        isDisabled ? classes.formControlLabelDisabled : classes.formControlLabelEnabled,
        isSelected ? classes.formControlLabelSelected : classes.formControlLabelUnselected,
      )}
      value={cycle}
      disabled={isDisabled}
      control={<Radio color="success" disabled={isDisabled} />}
      label={
        <Box className={classes.labelContainer}>
          <Box className={classes.titleRow}>
            <Typography variant="h6">
              {title}
              {showSavingsChip &&
                monthlyPrice > 0 &&
                annualSavings &&
                annualSavings > 0 &&
                savingsPercentage &&
                savingsPercentage > 0 && (
                  <Chip
                    label={`Save ${savingsPercentage.toString()}%`}
                    size="small"
                    color="success"
                    className={classes.savingsChip}
                  />
                )}
              {isCurrentlyActive && (
                <Typography component="span" variant="body2" color="text.secondary" className={classes.activeText}>
                  (Active now)
                </Typography>
              )}
            </Typography>
          </Box>

          {perSeatPrice > 0 && (
            <Box>
              {cycle === 'MONTHLY' ? (
                <Typography variant="body1" color="text.secondary">
                  <UnitNumber price value={perSeatPrice} unit="editor/mo" />
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    <UnitNumber value={monthlyEquivalent ?? 0} price unit="editor/mo" /> (billed annually)
                  </Typography>
                  {showSavingsText && annualSavings && annualSavings > 0 && (
                    <Typography variant="body2" color="success.main" className={classes.savingsText}>
                      {selectedCycle === cycle ? 'Saving ' : 'Save '}
                      <UnitNumber price value={annualSavings} unit="editor/year" nocolor />
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
      }
    />
  );
};
