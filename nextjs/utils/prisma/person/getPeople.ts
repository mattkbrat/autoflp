import prisma from "@/lib/prisma";

const getPeople = ( ) => {
    return prisma.person.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            account: {
                select: {
                    id: true,
                },
            },
            creditors: {
                select: {
                    id: true,
                    filing_fees: true,
                    apr: true,
                    business_name: true,
                }
            },
            salesman: {
                select: {
                    id: true,
                }
            },
        },
        orderBy: [{
            last_name: 'desc'
        }, {
            first_name: 'asc'
        }]
    });    
}

export default getPeople;