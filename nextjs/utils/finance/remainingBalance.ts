import { paymentsGetterType } from 'lib/prisma/payments';

function balance(deal: paymentsGetterType) {
  if (deal === null) return 0;

  const { pmt, lien, payment } = deal;

  if (pmt === null || lien === null) return 0;

  const totalPayments = payment.reduce((acc, payment) => {
    return acc + parseInt(payment.amount);
  }, 0);

  const total = +lien;
  const balance = total - totalPayments;

  return balance > 1 ? balance : 0;
}

export default balance;
