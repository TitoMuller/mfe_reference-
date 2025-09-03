import { StripePriceDto, SubscriptionMetric } from 'ze-sdk';
import { PricePlanMap } from '../hooks/useOverageCalculations';

export const calculatePricingData = (prices: StripePriceDto[]) => {
  const pricesObj: PricePlanMap = {
    seatPrice: 0,
    freeDeployments: 0,
    deploymentPrice: '',
  };
  const seatPrice = prices.find((price) => price.metadata.metric === SubscriptionMetric.SEATS);
  const deploymentPrice = prices.find((price) => price.metadata.metric === SubscriptionMetric.DEPLOYMENTS);
  const deploymentTiers = deploymentPrice?.tiers;
  if (deploymentTiers && deploymentTiers.length > 0) {
    const deploymentPaidTier = deploymentTiers.find((t) => !t.up_to);
    const deploymentFreeTier = deploymentTiers.find((t) => t.up_to);
    pricesObj.freeDeployments = deploymentFreeTier?.up_to ?? 0;
    pricesObj.deploymentPrice = deploymentPaidTier?.unit_amount_decimal ?? '';
  }
  pricesObj.seatPrice = seatPrice?.unit_amount ?? 0;
  return pricesObj;
};
