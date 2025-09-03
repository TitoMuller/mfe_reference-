import { Box, Grid2 as Grid, Stack, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { Button } from 'app-zephyr-components/Button';
import { SubscriptionDowngradeAlert } from 'app-zephyr-components/SubscriptionAlert/subscription-downgrade-alert';
import { PaymentMethodCard } from '../../payment-method-card';
import { useTypedParams } from 'app-zephyr-routes';
import { OrganizationValue } from 'ze-api-contract/organization-v2/get-by-name';
import {
  StripePaymentMethodDto,
  StripeSubscriptionItemDto,
  SubscriptionWithQuotasAndCouponDto,
  UsageQuotaDto,
} from 'ze-sdk';
import { CurrentSubscriptionCard } from '../CurrentSubscriptionCard';
import { TabSection } from '../TabSection';

export function ZeContent({
  subscription,
  usage,
  subscriptionItems,
  defaultPaymentMethod,
}: Readonly<{
  organization: OrganizationValue;
  subscription: SubscriptionWithQuotasAndCouponDto;
  subscriptionItems: StripeSubscriptionItemDto[];
  usage: UsageQuotaDto;
  defaultPaymentMethod?: StripePaymentMethodDto;
}>) {
  const { organization } = useTypedParams();
  if (!organization) {
    throw new Error('Organization not found');
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 2, flexDirection: 'column' }}>
      {subscription.scheduledTier && subscription.scheduleReason && (
        <SubscriptionDowngradeAlert
          targetTier={subscription.scheduledTier}
          reason={subscription.scheduleReason}
          effectiveDate={subscription.nextBillingAt}
          organizationName={organization}
        />
      )}
      <Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">Subscription</Typography>
            <Typography variant="body2" color="textDisabled">
              View your current plan, usage, and payment methods
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button component={Link} href="manage" variant="contained" color="secondary">
              Manage Subscriptions
            </Button>
          </Box>
        </Box>
      </Stack>
      <Typography sx={{ position: 'relative', fontWeight: 600 }} variant="body1">
        Current Plan
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ sm: 12, md: 6 }}>
          <CurrentSubscriptionCard subscriptionItems={subscriptionItems} subscription={subscription} usage={usage} />
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <PaymentMethodCard paymentMethod={defaultPaymentMethod} />
        </Grid>
      </Grid>
      <TabSection organizationName={organization} />
    </Box>
  );
}
