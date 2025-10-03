export const MaxOverageLimit = 999_999;

/**
 * A map containing the maximum quantity of each non-recurring metric.
 */
export const MaxQuantityNonRecurringMetricMap = {
  PERSONAL: {
    SEATS: 1,
  },
  TEAM: {
    SEATS: 10,
  },
  PRO: {
    SEATS: 20,
  },
  ENTERPRISE: {
    SEATS: 99_999,
  },
} as const;
