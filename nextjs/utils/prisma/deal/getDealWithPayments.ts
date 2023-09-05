import prisma from '@/lib/prisma';

async function getDealsWithPayments({ state }: { state: 0 | 1 }) {
  return prisma.deal
    .findMany({
      where: {
        state,
      },
      include: {
        payments: {
          select: {
            date: true,
            amount: true,
            id: true,
          },
        },
        dealTrades: true,
        inventory: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
          },
        },
        Account: {
          select: {
            person: true,
          },
        },
      },
    })
    .then((res) => {
      //   cast each payment for each deal to a date and then sort in ascending order
      return res.map((deal) => {
        return {
          ...deal,
          payments: deal.payments
            .map((p) => {
              return {
                ...p,
                date: new Date(p.date),
              };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
        };
      });
    });
}

export default getDealsWithPayments;
