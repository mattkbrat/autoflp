/**
 * @param monthsDelinquent
 * @returns "Good", "Delinquent", or "In-Default"
 */

function getCustomerStatus(monthsDelinquent: number) {
  if (monthsDelinquent < 0) {
    monthsDelinquent = 0;
  }

  switch (monthsDelinquent) {
    case 1:
    case 2:
      return 'Delinquent';
    case 0:
      return 'Good';
    default:
      return 'In-Default';
  }
}

export default getCustomerStatus;
