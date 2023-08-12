const totalPaid = (payments: number[]) =>
  payments.reduce((acc, payment) => {
    return acc + payment;
  }, 0);

export default totalPaid;
