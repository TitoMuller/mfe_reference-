import { Box, lighten, Paper, Stack, Typography } from '@mui/material';
import { SubscriptionCycleMap, SubscriptionDescriptionMap, SubscriptionNameMap } from 'app-zephyr-constants';
import { format } from 'date-fns';
import { UnitNumber } from '../../org-subscriptions-manage/components/ui/UnitNumber';
import { useMemo } from 'react';
import {
  SimpleMetricQuotaDto,
  StripeSubscriptionItemDto,
  SubscriptionWithQuotasAndCouponDto,
  UsageQuotaDto,
} from 'ze-sdk';
import { useStyles } from './styles';

export const CurrentSubscriptionCard = ({
  subscription,
  usage,
  subscriptionItems,
}: {
  subscription: SubscriptionWithQuotasAndCouponDto;
  usage: UsageQuotaDto;
  subscriptionItems: StripeSubscriptionItemDto[];
}) => {
  const { classes } = useStyles();
  const seats =
    subscription.quotas.find((q) => {
      return q.metric === 'SEATS';
    })?.limit ?? 1;
  const currentPrice = useMemo(
    () =>
      subscriptionItems.reduce<number>((acc, item) => {
        const ua = item.price.unit_amount;
        if (typeof ua !== 'number') {
          return acc;
        }
        return acc + ua;
      }, 0) * seats,
    [subscriptionItems, seats],
  );

  const seatMetric = useMemo<SimpleMetricQuotaDto>(() => {
    const seatMetric = subscription.quotas.find((q) => {
      return q.metric === 'SEATS';
    });
    if (!seatMetric) {
      throw new Error('Seat metric not found');
    }
    return seatMetric;
  }, [subscription.quotas]);

  const usagePercentage = useMemo(() => {
    if (!usage.used) {
      return 1;
    }
    return (usage.used / (seatMetric.limit ?? 1)) * 100;
  }, [seatMetric, usage.used]);

  const TIER_DESCRIPTIONS = SubscriptionDescriptionMap[subscription.tier];
  const TIER_NAME = SubscriptionNameMap[subscription.tier];
  const CYCLE_NAME = SubscriptionCycleMap[subscription.cycle];

  return (
    <Stack className={classes.root}>
      <Paper
        sx={(theme) => ({
          border: theme.palette.border.secondary,
          padding: theme.spacing(2),
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: theme.borderRadius.lg,
        })}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(1),
              minWidth: 0,
              flex: 1,
            })}
          >
            <Box
              sx={(theme) => ({
                display: 'flex',
                gap: theme.spacing(1.5),
                alignItems: 'center',
                flexWrap: 'wrap',
              })}
            >
              <Typography variant="h4">{TIER_NAME}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography
                  sx={(theme) => ({
                    display: 'flex',
                    flexShrink: 1,
                    color: theme.palette.brand.purple[300],
                    paddingX: theme.spacing(0.25),
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: theme.palette.brand.purple[950],
                    borderColor: theme.palette.brand.purple[500],
                    borderStyle: 'solid',
                  })}
                >
                  {CYCLE_NAME}
                </Typography>
              </Box>
            </Box>
            <Typography sx={(theme) => ({ color: lighten(theme.palette.tx.quarterary, 0.5) })}>
              {TIER_DESCRIPTIONS}
            </Typography>
          </Box>
          <Box className={classes.priceBox}>
            <Typography variant="h3" className={classes.priceText}>
              <UnitNumber
                value={currentPrice}
                unit={subscription.cycle === 'YEARLY' ? 'year' : 'month'}
                price
                nocolor
              />
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              {usage.used} of {seatMetric.limit} users
            </Typography>
            <Box className={classes.usageBox}>
              <Box
                sx={(theme) => ({
                  width: '100%',
                  height: 12,
                  bgcolor: theme.palette.brand.purple[950],
                  borderRadius: 2,
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: `${usagePercentage.toString()}%`,
                    height: '100%',
                    bgcolor: theme.palette.brand.purple[500],
                    borderRadius: 2,
                  })}
                />
              </Box>
            </Box>
            <Typography
              title={new Date(subscription.nextBillingAt).toISOString()}
              variant="body2"
              sx={(theme) => ({ position: 'absolute', top: 0, right: 0, color: theme.palette.tx.quarterary })}
            >
              Renews on{' '}
              {format(
                new Date(subscription.nextBillingAt),
                subscription.cycle === 'YEARLY' ? 'MMMM dd, yyyy' : 'MMMM dd',
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
};
