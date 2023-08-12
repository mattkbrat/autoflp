const businessName = process.env.BUSINESS_NAME;
const businessMotto = process.env.BUSINESS_MOTTO;
const salesTaxNumber = process.env.SALES_TAX_NUMBER;
const invoiceNumber = process.env.INVOICE_NUMBER;
const phoneNumber = process.env.PHONE_NUMBER;
const email = process.env.EMAIL;
const street = process.env.STREET;
const city = process.env.CITY;
const state = process.env.STATE;
const zip = process.env.ZIP;
const primaryDealerName = process.env.PRIMARY_DEALER_NAME;
const dealerNumber = process.env.DEALER_NUMBER;

const address = `${street}, ${city}, ${state} ${zip}`;

function getBusinessData() {
  return {
    businessName,
    businessMotto,
    salesTaxNumber,
    invoiceNumber,
    phoneNumber,
    email,
    street,
    city,
    state,
    zip,
    primaryDealerName,
    dealerNumber,
    address,
  };
}

export default getBusinessData;
