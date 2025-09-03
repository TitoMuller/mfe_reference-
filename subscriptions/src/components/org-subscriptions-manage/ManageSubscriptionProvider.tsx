import { useSuspenseQueries } from '@tanstack/react-query';
import { Error as ZeError } from 'app-zephyr-components/AlertContent';
import { type ReactNode, Suspense, createContext, useContext, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  BillingCycle,
  CouponDto,
  type StripePaymentMethodDto,
  type StripePriceDto,
  type StripeSubscriptionItemDto,
  SubscriptionTier,
  type SubscriptionWithQuotasAndCouponDto,
  getGetDefaultPaymentMethodQueryOptions,
  getGetStripeSubscriptionItemsSuspenseQueryOptions,
  getGetSubscriptionQueryOptions,
  getListAllStripePricesQueryOptions,
  getListPaymentMethodsQueryOptions,
} from 'ze-sdk';

import { SubscriptionsManageSkeleton } from './components/subscriptions-manage-skeleton';
import { PricePlanMappings, useOverageCalculations } from './hooks/useOverageCalculations';
import { type PlanCostData, usePlanPricing } from './hooks/usePlanPricing';
import { calculatePricingData } from './money-functions/extractPlanPricingData';

interface SubscriptionContextType {
  pricePlanMappings: PricePlanMappings;
  planCostData: PlanCostData;
  subscription: SubscriptionWithQuotasAndCouponDto;
  subscriptionItems: StripeSubscriptionItemDto[];
  stripePrices: StripePriceDto[];
  paymentMethods?: StripePaymentMethodDto[];
  organizationName: string;
}

export interface SubscriptionInputs {
  cycle: BillingCycle;
  coupon?: {
    alreadyApplied?: boolean;
    code: string;
    data?: CouponDto;
  };
  emailAddress: string[];
  metrics: {
    users: number;
    deploys: number | null;
    bandwidth: number;
  };
  overages: {
    deploys: {
      dollarLimit?: number;
      quantityLimit?: number;
      additional: number;
      overageType: 'NO_OVERAGE' | 'LIMIT_OVERAGE' | 'UNLIMITED';
    };
    bandwidth: {
      dollarLimit?: number;
      quantityLimit?: number;
      additional: number;
      overageType: 'NO_OVERAGE' | 'LIMIT_OVERAGE' | 'UNLIMITED';
    };
  };
  paymentMethod: string;
  planType: SubscriptionTier;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

interface SubscriptionProviderProps {
  children: ReactNode;
  organizationName: string;
}

export function ManageSubscriptionProvider({ children, organizationName }: SubscriptionProviderProps) {
  // Run payment-related queries in parallel
  const [
    { data: allStripePrices, error: pricingDictError },
    { data: subscriptionData, error: subscriptionDataError },
    { data: paymentMethods, error: paymentMethodsError },
    { data: subscriptionItems, error: subscriptionItemsError },
    { data: defaultPaymentMethodData, error: defaultPaymentMethodError },
  ] = useSuspenseQueries({
    queries: [
      getListAllStripePricesQueryOptions(),
      getGetSubscriptionQueryOptions({ organizationName }),
      getListPaymentMethodsQueryOptions({ organizationName }),
      getGetStripeSubscriptionItemsSuspenseQueryOptions({ organizationName }),
      getGetDefaultPaymentMethodQueryOptions({ organizationName }),
    ],
  });

  // Set default values based on current subscription or sane defaults
  const currentPlanTier = subscriptionData.data.tier;
  const currentPlanCycle = subscriptionData.data.cycle;

  // Find deployment quota and overage
  const deploymentQuota = subscriptionData.data.quotas.find((q) => q.metric === 'DEPLOYMENTS');

  const planDeploymentOveragePercentage = deploymentQuota?.overage;
  const planDeploymentQuantity = deploymentQuota?.limit ?? 0;

  // Get seats
  const seats =
    subscriptionData.data.quotas.find((q) => {
      return q.metric === 'SEATS';
    })?.limit ?? 1;

  const formDefaultPaymentMethod = defaultPaymentMethodData.data?.id;

  const pricePlanMappings = useMemo(() => {
    const mappings = {} as PricePlanMappings;

    // Iterate over all tiers and cycles to create mappings
    for (const tier of Object.values(SubscriptionTier)) {
      for (const cycle of Object.values(BillingCycle)) {
        mappings[`${tier}_${cycle}`] = calculatePricingData(
          allStripePrices.data.filter((price) => price.metadata.tier === tier && price.metadata.cycle === cycle),
        );
      }
    }

    return mappings;
  }, [allStripePrices.data]);

  // Get current plan mapping to calculate overage values
  const currentStripePrices = allStripePrices.data.filter(
    (price) => price.metadata.tier === currentPlanTier && price.metadata.cycle === currentPlanCycle,
  );
  const currentPlanMapping = useMemo(() => calculatePricingData(currentStripePrices), [currentStripePrices]);
  const overageCalculations = useOverageCalculations(currentPlanMapping);

  // Determine overage type and values based on percentage
  let overageValues;
  let overageType: 'NO_OVERAGE' | 'LIMIT_OVERAGE' | 'UNLIMITED' = 'NO_OVERAGE';

  if (planDeploymentOveragePercentage === null) {
    // Unlimited overages
    overageType = 'UNLIMITED';
    overageValues = {
      quantityLimit: 0,
      dollarLimit: 0,
      additional: Number.POSITIVE_INFINITY,
      deploymentPercentage: 0,
    };
  } else if (planDeploymentOveragePercentage === 0) {
    // No overages
    overageType = 'NO_OVERAGE';
    overageValues = {
      quantityLimit: 0,
      dollarLimit: 0,
      additional: 0,
      deploymentPercentage: 0,
    };
  } else {
    // Limited overages
    overageType = 'LIMIT_OVERAGE';
    const { dollarAmount } = overageCalculations.getOverageValuesFromPercentage(planDeploymentOveragePercentage ?? 0);

    overageValues = {
      quantityLimit: planDeploymentQuantity,
      dollarLimit: dollarAmount,
      additional: planDeploymentQuantity,
      deploymentPercentage: planDeploymentOveragePercentage,
    };
  }

  const methods = useForm<SubscriptionInputs>({
    mode: 'onBlur',
    defaultValues: {
      cycle: currentPlanCycle,
      planType: currentPlanTier,
      metrics: {
        users: seats,
        deploys: planDeploymentOveragePercentage,
        bandwidth: 0,
      },
      overages: {
        deploys: {
          overageType: overageType,
          quantityLimit: overageValues.quantityLimit,
          dollarLimit: overageValues.dollarLimit,
          additional: overageValues.additional,
        },
        bandwidth: {
          overageType: 'NO_OVERAGE',
          quantityLimit: 0,
          dollarLimit: 0,
        },
      },
      paymentMethod: formDefaultPaymentMethod ?? '',
      coupon: {
        alreadyApplied: Boolean(subscriptionData.data.coupon),
        code: subscriptionData.data.coupon?.stripeCouponId,
        data: subscriptionData.data.coupon,
      },
    },
  });

  const { watch, setValue } = methods;
  const selectedPlan = watch('planType');
  const selectedCycle = watch('cycle');

  useEffect(() => {
    if (defaultPaymentMethodData.data) {
      setValue('paymentMethod', defaultPaymentMethodData.data.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [defaultPaymentMethodData.data, setValue]);

  // Use the selected plan's prices
  const stripePrices = allStripePrices.data.filter(
    (price) => price.metadata.tier === selectedPlan && price.metadata.cycle === selectedCycle,
  );
  const planCostData = usePlanPricing(stripePrices);

  if (pricingDictError) {
    return <ZeError error={pricingDictError} />;
  }
  if (!planCostData) {
    return <ZeError error={new Error('Pricing dict not found')} />;
  }

  if (subscriptionDataError) {
    return <ZeError error={subscriptionDataError} />;
  }

  // Handle errors from parallel queries
  if (paymentMethodsError || subscriptionItemsError || defaultPaymentMethodError) {
    return <ZeError error={paymentMethodsError ?? subscriptionItemsError ?? defaultPaymentMethodError} />;
  }

  const value: SubscriptionContextType = {
    planCostData,
    pricePlanMappings,
    subscription: subscriptionData.data,
    subscriptionItems: subscriptionItems.data,
    stripePrices: stripePrices,
    paymentMethods: paymentMethods.data,
    organizationName,
  };

  return (
    <Suspense fallback={<SubscriptionsManageSkeleton />}>
      <SubscriptionContext.Provider value={value}>
        <FormProvider {...methods}>{children}</FormProvider>
      </SubscriptionContext.Provider>
    </Suspense>
  );
}

export function useManageSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useManageSubscription must be used within a ManageSubscriptionProvider');
  }
  return context;
}
