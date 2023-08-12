import formatDate from './format';
import { DateTime } from 'luxon';

function datePlusMonths(date: Date | string, months: number, format?: boolean) {
  if (typeof date === 'undefined') {
    console.error('date is undefined');
    return '';
  }

  if (typeof date === 'string') {
    // Check if date can be converted to Date
    if (isNaN(Date.parse(date))) {
      throw 'date is not a valid date';
    }
    date = new Date(date);
    // Add months
  }

  const dt = DateTime.fromJSDate(date);
  const dtPlusMonths = dt.plus({ months });

  if (format) {
    return formatDate(dtPlusMonths.toJSDate(), 'MM/dd/yyyy');
  }

  return dtPlusMonths.toJSDate();
}

export default datePlusMonths;
