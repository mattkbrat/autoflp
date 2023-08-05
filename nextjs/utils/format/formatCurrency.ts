/**
 * Takes a string and returns a formatted currency string or a dash if the input is null or NaN
 * @param number: string | null | undefined
 */
const formatCurrency = (number?: string | null): string => {
  if (!number || Number.isNaN(+number)) {
    return '-';
  }
  return (
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(+number || 0) || '-'
  );
};

export default formatCurrency;
