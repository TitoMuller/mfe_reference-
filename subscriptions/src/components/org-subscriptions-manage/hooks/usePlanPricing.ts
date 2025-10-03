import { useMemo } from 'react';
import { StripePriceDto } from 'ze-sdk';
import { calculatePricingData } from '../money-functions/extractPlanPricingData';

export interface PlanCostData {
  seatPrice: number;
  freeDeployments: number;
  deploymentPrice: string;
}

export function usePlanPricing(stripePrices: StripePriceDto[] | undefined): PlanCostData | undefined {
  return useMemo(() => {
    if (stripePrices && stripePrices.length > 0) {
      const currentSubPriceData = calculatePricingData(stripePrices);
      return currentSubPriceData;
    }
    return {
      seatPrice: 0,
      freeDeployments: 0,
      deploymentPrice: '',
    };
  }, [stripePrices]);
}
