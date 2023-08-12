type monthFormats =
  | 'yyyy-MM-dd'
  | 'MM/dd/yyyy'
  | 'B YYYY'
  | 'b YYYY'
  | 'MMMM d, yyyy'
  | 'b yy';

function formatDate(
  date: Date | string,
  format: monthFormats,
  _formatAttempt = 0,
): string {
  if (_formatAttempt > 2) {
    console.error('formatDate failed to format date', date, format);
    return '';
  }

  // Check if date matches format
  // 2022-08-18 11:05:17.6381833
  if (
    typeof date === 'string' &&
    date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{7}$/)
  ) {
    date = date.substring(0, 10);
  }

  if (typeof date === 'undefined') {
    console.error('date is undefined');
    return '';
  }

  if (typeof date === 'string') {
    if (date.includes('undefined')) {
      return '';
    }

    // Check if date can be converted to Date
    if (isNaN(Date.parse(date))) {
      let dateParts;
      let year = '';
      let month = '';
      let day = '';

      if (date.includes('-')) {
        dateParts = date.split('-');
      } else if (date.includes('/')) {
        dateParts = date.split('/');
      } else {
        console.error('date is not a valid date', date);
        return date;
      }

      dateParts.map((part) => {
        if (part.length === 4) {
          year = part;
        } else if (part.length === 2) {
          if (+part > 12) {
            day = part;
          } else {
            month = part;
          }
        }

        try {
          if (!isNaN(Date.parse(`${year}-${month}-${day}`))) {
            return;
          }
        } catch (e) {
          return date;
        }
      });

      date = `${year}-${month}-${day}`;
      formatDate(date, format, _formatAttempt + 1);

      if (isNaN(Date.parse(date))) {
        return date;
      }
    }

    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthString = month < 10 ? `0${month}` : `${month}`;
  const dayString = day < 10 ? `0${day}` : `${day}`;

  const monthLong = date.toLocaleString('default', { month: 'long' });
  const monthShort = date.toLocaleString('default', { month: 'short' });

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${monthString}-${dayString}`;
    case 'B YYYY':
      return `${monthLong} ${year}`;
    case 'b YYYY':
      return `${monthShort} ${year}`;
    case 'MMMM d, yyyy':
      return `${monthLong} ${day}, ${year}`;
    case 'b yy':
      return `${monthShort} '${year.toString().substring(2)}`;
    case 'MM/dd/yyyy':
    default:
      return `${monthString}/${dayString}/${year}`;
  }
}

export default formatDate;
