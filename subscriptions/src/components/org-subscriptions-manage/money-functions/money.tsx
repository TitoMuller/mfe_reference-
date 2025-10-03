export const formatPenniesToPriceNumber = (price: number, currency?: string | null, maximumFractionDigits?: number) => {
  const dollars = price / 100;
  const hasDecimals = dollars % 1 !== 0;

  return new Intl.NumberFormat('en-US', {
    style: currency === null ? undefined : 'currency',
    currency: currency === null ? undefined : (currency ?? 'USD'),
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: maximumFractionDigits ?? 2,
  }).format(dollars);
};
