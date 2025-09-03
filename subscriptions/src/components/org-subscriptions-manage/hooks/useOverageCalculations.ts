import { useMemo } from 'react';
import { BillingCycle, SubscriptionTier } from 'ze-sdk';

export type OverageType = 'NO_OVERAGE' | 'LIMIT_OVERAGE' | 'UNLIMITED';

interface OverageCalculations {
  /**
   * Calculate dollar amount from number of deployments
   */
  calculateDollarAmountFromDeployments: (deployments: number) => number;

  /**
   * Calculate number of deployments from dollar amount
   */
  calculateDeploymentsFromDollarAmount: (dollarAmount: number) => number;

  /**
   * Calculate overage percentage from number of deployments
   */
  calculateOveragePercentage: (deployments: number) => number;

  /**
   * Calculate number of deployments from overage percentage
   */
  calculateDeploymentsFromPercentage: (percentage: number) => number;

  /**
   * Calculate dollar amount from overage percentage
   */
  calculateDollarAmountFromPercentage: (percentage: number) => number;

  /**
   * Get all overage values from percentage
   */
  getOverageValuesFromPercentage: (percentage: number) => {
    deployments: number;
    dollarAmount: number;
    percentage: number;
  };

  /**
   * Convert overage values to appropriate form values
   */
  getFormValuesFromOveragePercentage: (percentage: number | null) => {
    overageType: OverageType;
    quantityLimit: number;
    dollarLimit: number;
    additional: number;
    deploymentPercentage: number;
  };

  /**
   * Calculate the price in pennies for additional deployments
   * based on the overage percentage and overage type
   */
  calculateAddonDeploymentPriceInPennies: (overageType: OverageType, deploymentPercentage: number | null) => number;

  /**
   * Calculate the cost for a specific number of deployment units
   * Used for display in pricing tables
   */
  calculatePriceForDeploymentUnits: (units: number) => number;

  /**
   * Get key plan values
   */
  getPlanValues: () => {
    freeDeploys: number;
    costPerDeployment: number;
    deploymentPriceInPennies: number;
  };
}

export type PricePlanKey = `${SubscriptionTier}_${BillingCycle}`;
export type PricePlanMappings = Record<PricePlanKey, PricePlanMap>;
export interface PricePlanMap {
  seatPrice: number;
  freeDeployments: number;
  deploymentPrice: string;
}

/**
 * Hook for calculating deployment overage values
 * This is the central place for all deployment overage calculations
 */
export function useOverageCalculations(pricePlanMapping: PricePlanMap): OverageCalculations {
  // Get key values from price plan
  const freeDeploys = pricePlanMapping.freeDeployments;
  const deploymentPriceInPennies = Number.parseFloat(pricePlanMapping.deploymentPrice);

  const costPerDeployment = useMemo(
    () => deploymentPriceInPennies / 100, // Convert pennies to dollars
    [deploymentPriceInPennies],
  );

  // Calculate dollar amount from deployments
  const calculateDollarAmountFromDeployments = (deployments: number): number => {
    const value = deployments * costPerDeployment;
    return Math.round(value * 100) / 100; // Round to 2 decimal places
  };

  // Calculate deployments from dollar amount
  const calculateDeploymentsFromDollarAmount = (dollarAmount: number): number => {
    return Math.floor(dollarAmount / costPerDeployment);
  };

  // Calculate percentage from deployments
  const calculateOveragePercentage = (deployments: number): number => {
    return deployments / freeDeploys;
  };

  // Calculate deployments from percentage
  const calculateDeploymentsFromPercentage = (percentage: number): number => {
    return Math.floor(percentage * freeDeploys);
  };

  // Calculate dollar amount from percentage
  const calculateDollarAmountFromPercentage = (percentage: number): number => {
    const deployments = calculateDeploymentsFromPercentage(percentage);
    return calculateDollarAmountFromDeployments(deployments);
  };

  // Get all overage values from percentage
  const getOverageValuesFromPercentage = (percentage: number) => {
    const deployments = calculateDeploymentsFromPercentage(percentage);
    const dollarAmount = calculateDollarAmountFromDeployments(deployments);
    return {
      deployments,
      dollarAmount,
      percentage,
    };
  };

  // Calculate the price in pennies for additional deployments
  const calculateAddonDeploymentPriceInPennies = (
    overageType: OverageType,
    deploymentPercentage: number | null,
  ): number => {
    if (overageType === 'LIMIT_OVERAGE' && deploymentPercentage) {
      // Calculate extra deployments cost in pennies
      return freeDeploys * deploymentPercentage * costPerDeployment * 100;
    }
    return 0;
  };

  // Calculate the cost for a specific number of deployment units (e.g., per 100)
  const calculatePriceForDeploymentUnits = (units: number): number => {
    return costPerDeployment * units;
  };

  // Get key plan values
  const getPlanValues = () => {
    return {
      freeDeploys,
      costPerDeployment,
      deploymentPriceInPennies,
    };
  };

  // Convert backend overage percentage to form values
  const getFormValuesFromOveragePercentage = (percentage: number | null) => {
    // Handle different cases
    if (percentage === null) {
      // Unlimited overages
      return {
        overageType: 'UNLIMITED' as OverageType,
        quantityLimit: 0,
        dollarLimit: 0,
        additional: 0,
        deploymentPercentage: 0,
      };
    } else if (percentage === 0) {
      // No overages
      return {
        overageType: 'NO_OVERAGE' as OverageType,
        quantityLimit: 0,
        dollarLimit: 0,
        additional: 0,
        deploymentPercentage: 0,
      };
    } else {
      // Limited overages
      const deployments = calculateDeploymentsFromPercentage(percentage);
      const dollarAmount = calculateDollarAmountFromDeployments(deployments);
      return {
        overageType: 'LIMIT_OVERAGE' as OverageType,
        quantityLimit: deployments,
        dollarLimit: dollarAmount,
        additional: deployments,
        deploymentPercentage: percentage,
      };
    }
  };

  return {
    calculateDollarAmountFromDeployments,
    calculateDeploymentsFromDollarAmount,
    calculateOveragePercentage,
    calculateDeploymentsFromPercentage,
    calculateDollarAmountFromPercentage,
    getOverageValuesFromPercentage,
    getFormValuesFromOveragePercentage,
    calculateAddonDeploymentPriceInPennies,
    calculatePriceForDeploymentUnits,
    getPlanValues,
  };
}
