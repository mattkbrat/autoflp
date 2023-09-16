function financeFormat({
  num,
  withoutCurrency = true,
}: {
  num?: number | string;
  withoutCurrency?: boolean;
}) {
  if (typeof num === 'undefined') {
    return '';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const formatted = formatter.format(+num);

  if (withoutCurrency) {
    return formatted.replace('$', '').trim();
  }

  return formatted;
}

export default financeFormat;
