import { addressFromPerson, fullNameFromPerson } from './functions';
import processArray from './functions/processArray';
import { dealByIdType } from 'lib/prisma/deals';

const dealerID = process.env.DEALER_ID;

function appFormBuilder(deal: dealByIdType) {
  if (typeof deal === 'undefined') {
    return [];
  }

  if (typeof dealerID === 'undefined') {
    throw 'Must be called as server-side function';
  }

  const personAddress = addressFromPerson({
    person: deal?.Account?.person,
  });

  const personFullName = fullNameFromPerson(deal?.Account?.person);

  const creditorAddress = addressFromPerson({
    person: deal?.creditors?.person,
  });

  const filled = [
    deal?.inventory.fuel,
    deal?.inventory.year,
    deal?.inventory.make,
    deal?.inventory.body,
    deal?.inventory.model,
    deal?.inventory.color,
    deal?.date,
    personFullName,
    // TODO: Add cosigner to deal
    deal?.Account.secondary_account,
    personAddress.street,
    personAddress.cityStateZip,
    deal?.creditors?.business_name,
    creditorAddress.street,
    creditorAddress.cityStateZip,
    deal?.lien,
    personFullName,
    deal?.Account?.license_number,
    deal?.Account?.license_expiration,
    deal?.Account?.date_of_birth,
    deal?.inventory.cwt,
    dealerID,
  ];

  const vinSplit = deal?.inventory.vin.split('') ?? [''];
  // append to beginning of filled array
  return processArray([...vinSplit, ...filled]);
}

export default appFormBuilder;
